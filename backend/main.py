"""
Vokaloka API
===============

This FastAPI backend implements a simple full‑stack backend for the Vokaloka
language learning app.  It supports user registration, login and
authentication, serves a prebuilt 100‑word Portuguese deck to every new
account, schedules reviews using a basic FSRS‑inspired spaced repetition
algorithm and exposes endpoints for flashcard review, statistics and
grammar lessons.

The server stores its data in a JSON file on disk.  The top‑level structure
looks like this:

```
{
  "users": [
    {
      "username": "alice",
      "password_hash": "...",      # salted SHA256 hash
      "decks": [ { "id": "deck1", "name": "Portuguese 100 Words", ... } ],
      "stats": { "streak": 0, "lastReviewDate": null },
    },
    ...
  ],
  "cards": [
    { "id": "alice_1", "user": "alice", "deck_id": "deck1",
      "front": "olá", "back": "hello",
      "EF": 2.5, "interval": 0, "repetitions": 0, "difficulty": 2.5,
      "stability": 0.0, "next_review": null },
    ...
  ],
  "default_deck": {
    "id": "deck1",
    "name": "Portuguese 100 Words",
    "description": "Most common Portuguese words and their English translations",
    "cards": [ { "front": "e", "back": "and" }, ... ]
  },
  "grammar": {
    "beginner": [ { "id": "articles", "title": "Basic Articles", "content": "..." }, ... ],
    "intermediate": [ ... ],
    "advanced": [ ... ]
  }
}
```

To persist user sessions, the application keeps an in‑memory dictionary mapping
generated tokens to usernames.  These sessions are not persisted across
server restarts and exist solely to illustrate authenticated requests in
development.

Endpoints summary
------------------

* `POST /api/register` – create a new account (username & password).
* `POST /api/login` – authenticate and obtain a session token.
* `GET /api/decks` – list the current user's decks.
* `GET /api/decks/{deck_id}` – fetch a single deck and its cards.
* `GET /api/cards/next` – fetch the next due card for review (optionally filter by deck).
* `POST /api/review` – submit a review result (quality) for a card.
* `GET /api/statistics` – get user statistics (streak, last review, counts, CEFR level).
* `GET /api/words` – list all words with their learning status.
* `GET /api/grammar` – list grammar categories.
* `GET /api/grammar/{level}` – list bite‑sized lessons for a given level.
* `GET /api/grammar/{level}/{lesson_id}` – fetch the content of a grammar lesson.

The FSRS (Free Spaced Repetition Scheduler) algorithm implemented here is
a simplified interpretation of the open‑source FSRS algorithm.  It
maintains each card's ease factor (EF), interval, repetitions count,
difficulty and stability.  When the user answers a card, the
`update_card_fsrs` function adjusts these parameters and schedules the
next review date.  Although the implementation here is not a faithful
reproduction of FSRS, it provides a more nuanced progression than the
classic SM‑2 algorithm and is easily extensible.

Run the server with:

```
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```
"""

from __future__ import annotations

import json
import hashlib
import uuid
import os
import binascii
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, Any, Optional, List, Tuple

from fastapi import FastAPI, HTTPException, Depends, Header, Query, status
from fastapi.middleware.cors import CORSMiddleware

DATA_FILE = Path(__file__).resolve().parent / "data.json"

app = FastAPI(title="Vokaloka API")

# Allow CORS for all origins during development; adjust in production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# In‑memory session store: token -> username
# In‑memory session store: token -> username
SESSIONS: Dict[str, str] = {}

# Legacy password salt used by older accounts (kept for compatibility)
PASSWORD_SALT = "vokaloka_salt"

# Improved password hashing using PBKDF2 with per-user salt.
# Backwards compatible with the original salted SHA256 hashes stored
# as plain hex. New registrations and password-upgrades will use the
# PBKDF2 format: "pbkdf2$<iters>$<salt_hex>$<hash_hex>"
DEFAULT_PBKDF2_ITERS = 100_000


def _pbkdf2_hash(password: str, salt: bytes, iterations: int = DEFAULT_PBKDF2_ITERS) -> str:
    dk = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, iterations)
    return binascii.hexlify(dk).decode('ascii')


def hash_password(password: str) -> str:
    """Return a new password hash using PBKDF2 with a random salt.

    Format: pbkdf2$<iterations>$<salt_hex>$<hash_hex>
    """
    salt = os.urandom(16)
    h = _pbkdf2_hash(password, salt)
    return f"pbkdf2${DEFAULT_PBKDF2_ITERS}${binascii.hexlify(salt).decode('ascii')}${h}"


def verify_password(password: str, stored: str) -> bool:
    """Verify a password against either the new PBKDF2 format or the
    legacy salted SHA256 hex hash. If the legacy format is detected and
    verification succeeds, callers may wish to upgrade the stored hash.
    """
    if not stored:
        return False
    if stored.startswith('pbkdf2$'):
        try:
            _, iters_s, salt_hex, hash_hex = stored.split('$')
            iters = int(iters_s)
            salt = binascii.unhexlify(salt_hex)
            return _pbkdf2_hash(password, salt, iters) == hash_hex
        except Exception:
            return False
    # Fallback: legacy salted SHA256 (PASSWORD_SALT-based)
    # preserve original behavior for existing users
    legacy = hashlib.sha256((PASSWORD_SALT + password).encode('utf-8')).hexdigest()
    return legacy == stored


def load_default_deck() -> Dict[str, Any]:
    """Return the static default deck of 100 Portuguese words."""
    # List of (front, back) pairs; duplicates are tolerated but trimmed to 100 entries
    words: List[Tuple[str, str]] = [
        ("e", "and"), ("o", "the"), ("a", "the"), ("que", "that"), ("de", "of"),
        ("não", "not"), ("ser", "to be"), ("em", "in"), ("um", "a"), ("para", "for"),
        ("com", "with"), ("estar", "to be"), ("ter", "to have"), ("se", "if"), ("por", "by"),
        ("fazer", "to do"), ("dizer", "to say"), ("poder", "can"), ("outro", "other"), ("ir", "go"),
        ("ver", "see"), ("vir", "come"), ("saber", "know"), ("querer", "want"), ("dar", "give"),
        ("usar", "use"), ("achar", "find"), ("aqui", "here"), ("coisa", "thing"), ("então", "then"),
        ("bom", "good"), ("homem", "man"), ("sempre", "always"), ("tudo", "everything"), ("pouco", "little"),
        ("lugar", "place"), ("trabalho", "work"), ("vida", "life"), ("mundo", "world"), ("tempo", "time"),
        ("pessoa", "person"), ("meu", "my"), ("seu", "your"), ("nosso", "our"), ("novo", "new"),
        ("dia", "day"), ("ano", "year"), ("noite", "night"), ("bem", "well"), ("mal", "bad"),
        ("casa", "house"), ("mulher", "woman"), ("criança", "child"), ("amigo", "friend"), ("amor", "love"),
        ("dinheiro", "money"), ("olho", "eye"), ("mão", "hand"), ("hora", "hour"), ("vez", "time (occurrence)"),
        ("porque", "because"), ("algum", "some"), ("todo", "all"), ("depois", "after"), ("antes", "before"),
        ("mesmo", "same"), ("melhor", "better"), ("grande", "big"), ("pequeno", "small"), ("primeiro", "first"),
        ("último", "last"), ("nunca", "never"), ("talvez", "maybe"), ("já", "already"), ("ainda", "still"),
        ("hoje", "today"), ("amanhã", "tomorrow"), ("ontem", "yesterday"), ("dois", "two"), ("três", "three"),
        ("quatro", "four"), ("cinco", "five"), ("seis", "six"), ("sete", "seven"), ("oito", "eight"),
        ("nove", "nine"), ("dez", "ten"), ("meio", "half"), ("caminho", "path"), ("cima", "up"),
        ("baixo", "down"), ("direita", "right"), ("esquerda", "left"), ("sim", "yes"), ("tal", "such"),
        ("sobre", "about"), ("perto", "near"), ("longe", "far"), ("pergunta", "question"), ("resposta", "answer")
    ]
    # Trim or pad to exactly 100 entries
    if len(words) > 100:
        words = words[:100]
    elif len(words) < 100:
        index = 0
        while len(words) < 100:
            words.append(words[index])
            index = (index + 1) % len(words)
    return {
        "id": "deck1",
        "name": "Portuguese 100 Words",
        "description": "Most common Portuguese words and their English translations",
        "cards": [ { "front": w[0], "back": w[1] } for w in words ]
    }


def load_default_grammar() -> Dict[str, List[Dict[str, str]]]:
    """Return a default set of grammar lessons grouped by level."""
    return {
        "beginner": [
            {
                "id": "articles",
                "title": "Basic Articles",
                "content": (
                    "Portuguese definite articles (o/a/os/as) correspond to 'the' in English.\n"
                    "Indefinite articles (um/uma/uns/umas) correspond to 'a' or 'an'.\n"
                    "For example: 'o livro' (the book), 'uma casa' (a house)."
                ),
            },
            {
                "id": "gender",
                "title": "Gender in Portuguese",
                "content": (
                    "Most Portuguese nouns are either masculine or feminine.\n"
                    "Masculine nouns often end in '-o' and feminine nouns in '-a',\n"
                    "though there are exceptions.  Adjectives must agree in gender and number\n"
                    "with the nouns they modify."
                ),
            },
            {
                "id": "prepositions",
                "title": "Simple Prepositions",
                "content": (
                    "Common prepositions include 'em' (in/at), 'de' (of/from), 'para' (for/to).\n"
                    "When combined with articles they contract: 'em' + 'a' = 'na', 'de' + 'o' = 'do'."
                ),
            },
        ],
        "intermediate": [
            {
                "id": "past_tenses",
                "title": "Past Tenses",
                "content": (
                    "Portuguese has two main past tenses: the pretérito perfeito (simple past)\n"
                    "and the pretérito imperfeito (imperfect).  The simple past describes completed\n"
                    "actions, while the imperfect describes ongoing or habitual past actions."
                ),
            },
            {
                "id": "gente",
                "title": "Using 'a gente'",
                "content": (
                    "In Brazilian Portuguese, 'a gente' is an informal way to say 'we'.\n"
                    "It always takes third person singular verb forms.  For example:\n"
                    "'A gente vai ao cinema' (We're going to the cinema)."
                ),
            },
            {
                "id": "object_pronouns",
                "title": "Direct and Indirect Object Pronouns",
                "content": (
                    "Direct object pronouns (me, te, o, a, nos, vos, os, as) replace the object of a verb.\n"
                    "Indirect object pronouns (me, te, lhe, nos, vos, lhes) indicate to whom or for whom."
                ),
            },
        ],
        "advanced": [
            {
                "id": "subjunctive",
                "title": "Subjunctive Mood",
                "content": (
                    "The subjunctive mood expresses doubt, desire, or uncertainty.\n"
                    "It has present, past and future forms and is often triggered by phrases like\n"
                    "'para que', 'a fim de que', or verbs expressing desire."
                ),
            },
            {
                "id": "conditional",
                "title": "Conditional Sentences",
                "content": (
                    "Conditional sentences in Portuguese use the conjunction 'se' (if).\n"
                    "They combine the imperfect subjunctive with the conditional or future tense\n"
                    "to express hypothetical situations.  For example: 'Se eu tivesse dinheiro, viajaria'."
                ),
            },
            {
                "id": "gerund",
                "title": "Progressive Aspect and Gerund",
                "content": (
                    "The gerund (‑ndo) conveys ongoing action.  Combine with 'estar' to form the\n"
                    "progressive: 'Estou estudando' (I am studying)."
                ),
            },
        ],
    }


def load_data() -> Dict[str, Any]:
    """Load JSON data from the file, or initialize defaults if missing/corrupted."""
    if not DATA_FILE.exists():
        data = {
            "users": [],
            "cards": [],
            "default_deck": load_default_deck(),
            "grammar": load_default_grammar(),
        }
        save_data(data)
        return data
    try:
        with DATA_FILE.open("r", encoding="utf-8") as f:
            data = json.load(f)
    except Exception:
        # If loading fails, start with defaults
        data = {
            "users": [],
            "cards": [],
            "default_deck": load_default_deck(),
            "grammar": load_default_grammar(),
        }
        save_data(data)
    # Ensure default deck and grammar exist
    if "default_deck" not in data:
        data["default_deck"] = load_default_deck()
    if "grammar" not in data:
        data["grammar"] = load_default_grammar()
    # settings were not part of the original schema; keep data minimal
    if "users" not in data:
        data["users"] = []
    if "cards" not in data:
        data["cards"] = []
    return data


def save_data(data: Dict[str, Any]) -> None:
    """Persist data back to the JSON file."""
    with DATA_FILE.open("w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def current_user(token: str = Header(None), authorization: str = Header(None)) -> Dict[str, Any]:
    """Dependency to get the current authenticated user from the session token.

    Accepts either a custom `token` header for backward compatibility or the
    standard `Authorization: Bearer <token>` header.
    """
    t = token
    if not t and authorization:
        # Accept 'Bearer <token>' or raw token
        if authorization.lower().startswith('bearer '):
            t = authorization.split(' ', 1)[1].strip()
        else:
            t = authorization.strip()
    if not t:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing authentication token")
    username = SESSIONS.get(t)
    if not username:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")
    data = load_data()
    user = next((u for u in data["users"] if u["username"] == username), None)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user


def update_stats(stats: Dict[str, Any], quality: int) -> None:
    """Update the user's daily streak based on the review quality and date."""
    today = datetime.utcnow().date()
    last_date_str = stats.get("lastReviewDate")
    try:
        last_date = datetime.fromisoformat(last_date_str).date() if last_date_str else None
    except Exception:
        last_date = None
    if last_date is None:
        stats["streak"] = 1
    else:
        delta = (today - last_date).days
        if delta == 1:
            stats["streak"] = stats.get("streak", 0) + 1
        elif delta == 0:
            stats["streak"] = max(stats.get("streak", 0), 1)
        else:
            stats["streak"] = 1
    stats["lastReviewDate"] = today.isoformat()


def update_card_fsrs(card: Dict[str, Any], quality: int) -> None:
    """
    Update a card's scheduling parameters using a simplified FSRS‑inspired algorithm.

    Parameters
    ----------
    card : dict
        The card to update.  Must include 'EF', 'interval', 'repetitions', 'difficulty',
        'stability' and 'next_review' fields.  Missing fields will be populated with
        sensible defaults.
    quality : int
        The quality of the response.  Expected values:
        0 – failed/forgot (red)
        3 – normal recall (yellow/good)
        4 or 5 – easy recall (green)

    Notes
    -----
    The algorithm here combines aspects of SM‑2 and FSRS for demonstration purposes:

    * If the quality is 0, the card is considered failed: repetitions are reset, the
      interval is set to 1 day and the ease factor (EF) is slightly decreased.  Stability
      is reset and difficulty increases.
    * For successful reviews, the interval grows multiplicatively by the EF and the
      repetitions count increments.  The EF is adjusted up or down based on the
      quality but never drops below 1.3.  Stability increases modestly and
      difficulty gradually decreases.  The next review date is scheduled accordingly.
    """
    EF = float(card.get("EF", 2.5))
    interval = float(card.get("interval", 0.0))
    repetitions = int(card.get("repetitions", 0))
    difficulty = float(card.get("difficulty", 2.5))
    stability = float(card.get("stability", 0.0))

    # Map arbitrary quality numbers into a reduced 0–3 scale
    # 0 = fail, 1 = hard, 2 = good, 3 = easy
    if quality <= 1:
        rating = 0
    elif quality == 2 or quality == 3:
        rating = 2  # treat 2 or 3 as good
    else:
        rating = 3  # easy

    if rating == 0:
        # failure: reset repetitions and reduce ease factor and stability
        repetitions = 0
        interval = 1
        # Drastically decrease EF on failure so the card drops to learning status
        EF = max(1.3, EF - 0.8)
        difficulty = difficulty + 0.1  # becomes slightly more difficult
        stability = 0.0
    else:
        # success: increase repetitions and schedule new interval
        if repetitions == 0:
            interval = 1
        elif repetitions == 1:
            interval = 6
        else:
            interval = interval * EF
        # update EF using a SM‑2 style adjustment on the reduced rating
        EF = EF + (0.1 - (3 - rating) * (0.08 + (3 - rating) * 0.02))
        if EF < 1.3:
            EF = 1.3
        repetitions += 1
        # update difficulty and stability gradually
        difficulty = max(1.3, difficulty - 0.05 * rating)
        stability += 1.0 + 0.5 * rating
    # compute next review date
    next_date = datetime.utcnow() + timedelta(days=interval)
    # assign updates
    card["EF"] = EF
    card["interval"] = interval
    card["repetitions"] = repetitions
    card["difficulty"] = difficulty
    card["stability"] = stability
    card["next_review"] = next_date.isoformat()


@app.post("/api/register")
def register(body: Dict[str, str]) -> Any:
    """
    Register a new user account.  The request body must contain `username`
    and `password`.  A new user record is created and the default 100‑card deck
    is copied into their account.  The response simply indicates success.
    """
    username = body.get("username")
    password = body.get("password")
    if not username or not password:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username and password are required")
    data = load_data()
    # Check if username already exists
    if any(u["username"] == username for u in data["users"]):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username already taken")
    # Create new user
    user = {
        "username": username,
        "password_hash": hash_password(password),
        "decks": [
            {
                "id": data["default_deck"]["id"],
                "name": data["default_deck"]["name"],
                "description": data["default_deck"].get("description", ""),
            }
        ],
        "stats": { "streak": 0, "lastReviewDate": None },
    }
    data["users"].append(user)
    # Copy default cards into user‑specific card list
    for idx, c in enumerate(data["default_deck"]["cards"]):
        card_id = f"{username}_{idx+1}"
        # Initialize new user's cards in a 'learning' state by setting EF below
        # the learning threshold (1.8). This ensures newly created accounts
        # start with all words in the 'learning' bucket.
        data["cards"].append({
            "id": card_id,
            "user": username,
            "deck_id": data["default_deck"]["id"],
            "front": c["front"],
            "back": c["back"],
            # EF intentionally set low so status = 'learning' (EF < 1.8)
            "EF": 1.5,
            "interval": 0.0,
            "repetitions": 0,
            "difficulty": 2.5,
            "stability": 0.0,
            "next_review": None,
        })
    save_data(data)
    return {"message": "Account created"}


@app.post("/api/login")
def login(body: Dict[str, str]) -> Any:
    """
    Authenticate a user and return a session token.  The request body must
    include `username` and `password`.  On successful login, a random token
    is generated and returned to the client.  The client must include this
    token in the `token` header of subsequent requests.
    """
    username = body.get("username")
    password = body.get("password")
    if not username or not password:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username and password are required")
    data = load_data()
    user = next((u for u in data["users"] if u["username"] == username), None)
    if not user or not verify_password(password, user.get("password_hash")):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    # If the user's password is stored in the legacy SHA256 format, upgrade it
    stored = user.get("password_hash", "")
    if stored and not stored.startswith('pbkdf2$'):
        try:
            user["password_hash"] = hash_password(password)
            save_data(data)
        except Exception:
            # If upgrade fails, continue without preventing login
            pass

    # Generate a new session token
    token = uuid.uuid4().hex
    SESSIONS[token] = username
    return {"token": token}


@app.get("/api/decks")
def get_decks(user: Dict[str, Any] = Depends(current_user)) -> Any:
    """Return the authenticated user's decks."""
    return user.get("decks", [])


@app.get("/api/decks/{deck_id}")
def get_deck(deck_id: str, user: Dict[str, Any] = Depends(current_user)) -> Any:
    """Return a single deck and its cards for the authenticated user."""
    if deck_id not in [d["id"] for d in user.get("decks", [])]:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Deck not found")
    data = load_data()
    cards = [c for c in data["cards"] if c.get("user") == user["username"] and c.get("deck_id") == deck_id]
    deck_meta = next(d for d in user.get("decks", []) if d["id"] == deck_id)
    return {"deck": deck_meta, "cards": cards}


@app.get("/api/cards/next")
def get_next_card(
    deckId: Optional[str] = Query(default=None, alias="deckId"),
    user: Dict[str, Any] = Depends(current_user)
) -> Any:
    """Return the next due card for the user, optionally filtered by deck."""
    data = load_data()
    # Filter cards belonging to this user
    cards = [c for c in data["cards"] if c.get("user") == user["username"]]
    if deckId:
        if deckId not in [d["id"] for d in user.get("decks", [])]:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Deck not found")
        cards = [c for c in cards if c.get("deck_id") == deckId]
    # Separate due (scheduled) cards and new cards
    now = datetime.utcnow()
    due_cards: List[Dict[str, Any]] = []
    new_cards: List[Dict[str, Any]] = []
    for c in cards:
        nr = c.get("next_review")
        if not nr:
            new_cards.append(c)
            continue
        try:
            due = datetime.fromisoformat(nr)
        except Exception:
            due = datetime.min
        if due <= now:
            due_cards.append(c)

    # Always prefer due cards
    if due_cards:
        # return earliest due
        due_cards.sort(key=lambda c: datetime.fromisoformat(c.get("next_review") or now.isoformat()))
        c = due_cards[0]
        return {"id": c["id"], "question": c["front"], "answer": c["back"]}

    # If there are new (never-reviewed) cards, return the first one.
    if new_cards:
        c = new_cards[0]
        return {"id": c["id"], "question": c["front"], "answer": c["back"]}
    return None


@app.post("/api/review")
def submit_review(body: Dict[str, Any], user: Dict[str, Any] = Depends(current_user)) -> Any:
    """
    Record a review outcome for a card.  Expects a JSON body with fields:
    * `cardId`: the ID of the card being reviewed.
    * `quality`: the quality of the answer (0 = fail, 3 = yellow/good, 4/5 = green/easy).

    The card's scheduling parameters are updated and the user's statistics
    are adjusted accordingly.
    """
    card_id = body.get("cardId")
    quality = body.get("quality")
    if card_id is None or quality is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="cardId and quality are required")
    data = load_data()
    card = next((c for c in data["cards"] if c.get("id") == card_id and c.get("user") == user["username"]), None)
    if not card:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Card not found")
    # detect whether this was a new card (no next_review set yet)
    was_new = not bool(card.get("next_review"))
    update_card_fsrs(card, int(quality))
    update_stats(user.setdefault("stats", {"streak": 0, "lastReviewDate": None}), int(quality))

    save_data(data)
    return {"message": "Review recorded"}


@app.get("/api/statistics")
def get_statistics(user: Dict[str, Any] = Depends(current_user)) -> Any:
    """
    Return statistics for the authenticated user.

    The response includes:
    * `streak` – current daily streak.
    * `lastReviewDate` – ISO string of the last review date.
    * `learning`, `developing`, `good` – counts of words in each status.
    * `totalWords` – total cards in the user's deck(s).
    * `knownWords` – number of cards with status 'good'.
    * `cefrLevel` – an estimated CEFR level based on the number of known words.
    """
    data = load_data()
    cards = [c for c in data["cards"] if c.get("user") == user["username"]]
    # Determine status counts based on EF thresholds
    counts = {"learning": 0, "developing": 0, "good": 0}
    for c in cards:
        ef = float(c.get("EF", 1.0))
        if ef < 1.8:
            counts["learning"] += 1
        elif ef < 2.3:
            counts["developing"] += 1
        else:
            counts["good"] += 1
    total = len(cards)
    known = counts["good"]
    # Estimate CEFR level based on number of known words
    if known < 20:
        level = "A1"
    elif known < 40:
        level = "A2"
    elif known < 60:
        level = "B1"
    elif known < 80:
        level = "B2"
    else:
        level = "C1"
    # build a small schedule projection for the next 30 days (0 = today)
    horizon = 30
    due_in_days = [0] * (horizon + 1)
    today_date = datetime.utcnow().date()
    for c in cards:
        nr = c.get("next_review")
        if not nr:
            bucket = 0
        else:
            try:
                d = datetime.fromisoformat(nr).date()
                bucket = (d - today_date).days
            except Exception:
                bucket = 0
        if bucket < 0:
            bucket = 0
        if bucket > horizon:
            bucket = horizon
        due_in_days[bucket] += 1

    stats = user.get("stats", {"streak": 0, "lastReviewDate": None})
    return {
        "streak": stats.get("streak", 0),
        "lastReviewDate": stats.get("lastReviewDate"),
        "learning": counts["learning"],
        "developing": counts["developing"],
        "good": counts["good"],
        "totalWords": total,
        "knownWords": known,
        "cefrLevel": level,
        "dueInDays": due_in_days,
        "dueToday": due_in_days[0],
    }


@app.get("/api/words")
def get_words(user: Dict[str, Any] = Depends(current_user)) -> Any:
    """
    Return all words for the authenticated user with their learning status and deck info.
    Each entry contains:
    * `id` – card ID
    * `word` – the front of the card
    * `status` – learning | developing | good
    * `deckId` – deck identifier
    * `deckName` – human‑readable deck name
    """
    data = load_data()
    deck_lookup: Dict[str, str] = {d["id"]: d.get("name", "") for d in user.get("decks", [])}
    words = []
    for c in data["cards"]:
        if c.get("user") != user["username"]:
            continue
        ef = float(c.get("EF", 2.5))
        if ef < 1.8:
            status = "learning"
        elif ef < 2.3:
            status = "developing"
        else:
            status = "good"
        deck_id = c.get("deck_id")
        words.append({
            "id": c["id"],
            "word": c["front"],
            "status": status,
            "deckId": deck_id,
            "deckName": deck_lookup.get(deck_id, "")
        })
    return words


@app.get("/api/grammar")
def get_grammar_categories() -> Any:
    """Return the list of grammar levels available (beginner, intermediate, advanced)."""
    data = load_data()
    return list(data.get("grammar", {}).keys())


@app.get("/api/grammar/{level}")
def get_grammar_by_level(level: str) -> Any:
    """Return the list of lessons for the given grammar level."""
    data = load_data()
    grammar = data.get("grammar", {})
    if level not in grammar:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Grammar level not found")
    return grammar[level]


@app.get("/api/grammar/{level}/{lesson_id}")
def get_grammar_lesson(level: str, lesson_id: str) -> Any:
    """Return the content of a specific grammar lesson."""
    data = load_data()
    grammar = data.get("grammar", {})
    if level not in grammar:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Grammar level not found")
    lessons = grammar[level]
    lesson = next((l for l in lessons if l["id"] == lesson_id), None)
    if not lesson:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lesson not found")
    return lesson


@app.get('/api/settings')
def get_settings(user: Dict[str, Any] = Depends(current_user)) -> Any:
    """Return global settings and the user's personal settings."""
    data = load_data()
    settings = data.get('settings', {})
    # Attach per-user settings as well
    user_settings = user.get('settings', {})
    return {'global': settings, 'user': user_settings}


@app.post('/api/settings')
def post_settings(body: Dict[str, Any], user: Dict[str, Any] = Depends(current_user)) -> Any:
    """Update settings. Accepts either global settings (requires caution)
    or per-user settings. This endpoint accepts keys:
    - global_new_per_day
    - model
    - force_model
    - new_per_day (per-user)
    """
    data = load_data()
    updated = {}
    # Global updates
    if 'global_new_per_day' in body:
        data.setdefault('settings', {})['global_new_per_day'] = int(body['global_new_per_day'])
        updated['global_new_per_day'] = data['settings']['global_new_per_day']
    if 'model' in body:
        data.setdefault('settings', {})['model'] = str(body['model'])
        updated['model'] = data['settings']['model']
    if 'force_model' in body:
        data.setdefault('settings', {})['force_model'] = bool(body['force_model'])
        updated['force_model'] = data['settings']['force_model']

    # Per-user settings
    if 'new_per_day' in body:
        user.setdefault('settings', {})['new_per_day'] = int(body['new_per_day'])
        updated['new_per_day'] = user['settings']['new_per_day']

    save_data(data)
    return {'message': 'Settings updated', 'updated': updated}
