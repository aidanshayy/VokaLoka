
/**
 * Helper to build request headers including the auth token if present.
 */
function buildHeaders(extra: Record<string, string> = {}): HeadersInit {
  const headers: Record<string, string> = { ...extra };
  const token = localStorage.getItem('token');
  if (token) {
    // The backend expects the token in the request header named "token"
    headers['token'] = token;
  }
  return headers;
}

export async function fetchDecks() {
  try {
    const response = await fetch('/api/decks', { headers: buildHeaders() });
    if (!response.ok) throw new Error('Failed to fetch decks');
    return await response.json();
  } catch {
    // stub fallback for offline development
    return [];
  }
}

/**
 * Fetch the next card due for review.  If a deckId is provided, the backend will
 * return the next card from that deck.  Otherwise it returns the next card
 * across all decks.
 */
export async function fetchNextCard(deckId?: string) {
  try {
    const url = deckId ? `/api/cards/next?deckId=${encodeURIComponent(deckId)}` : '/api/cards/next';
    const response = await fetch(url, { headers: buildHeaders() });
    if (!response.ok) throw new Error('Failed to fetch card');
    return await response.json();
  } catch {
    // stub fallback
    return {
      id: '1',
      question: 'Como vai?',
      answer: 'How are you?',
    };
  }
}

/**
 * Fetch a single deck and its cards from the backend.  Returns an object with
 * properties `deck` and `cards`.
 */
export async function fetchDeck(deckId: string) {
  const response = await fetch(`/api/decks/${deckId}`, { headers: buildHeaders() });
  if (!response.ok) {
    throw new Error('Failed to fetch deck');
  }
  return await response.json();
}

/**
 * Fetch aggregated statistics such as daily streak and words known.
 */
export async function fetchStatistics() {
  const response = await fetch('/api/statistics', { headers: buildHeaders() });
  if (!response.ok) {
    throw new Error('Failed to fetch statistics');
  }
  return await response.json();
}

/**
 * Fetch all words reviewed by the user along with their learning status.
 */
export async function fetchWords() {
  const response = await fetch('/api/words', { headers: buildHeaders() });
  if (!response.ok) {
    throw new Error('Failed to fetch words');
  }
  return await response.json();
}

export async function submitReview(cardId: string, quality: number) {
  try {
    const response = await fetch('/api/review', {
      method: 'POST',
      headers: buildHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ cardId, quality }),
    });
    if (!response.ok) throw new Error('Failed to submit review');
  } catch {
    // stub fallback; ignore
  }
}

/**
 * Register a new user.  Returns a success message or throws on error.
 */
export async function register(username: string, password: string) {
  try {
    // Attempt to register a new user account.  If the server responds with
    // an error status, we try to extract a detailed message from the JSON
    // body.  Failing that, we fall back to the HTTP status text or a generic
    // error.  Network failures are caught separately.
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    let data: any = {};
    try {
      data = await res.clone().json();
    } catch {
      // If parsing fails, we'll use status text or a generic fallback
    }
    if (!res.ok) {
      // Prefer backend‐provided detail or message fields
      const msg = (data && (data.detail || data.message)) || res.statusText || 'Registration failed';
      throw new Error(msg);
    }
    return data;
  } catch (err) {
    // Network or fetch error (e.g. backend not running)
    throw new Error('Unable to connect to the server. Please ensure the backend is running.');
  }
}

/**
 * Log in with a username and password.  On success stores the returned token
 * in localStorage and returns it.  Throws an error on failure.
 */
export async function login(username: string, password: string) {
  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.detail || 'Login failed');
    }
    const data = await res.json();
    if (data.token) {
      localStorage.setItem('token', data.token);
    }
    return data.token;
  } catch (err) {
    throw new Error('Unable to connect to the server. Please ensure the backend is running.');
  }
}

/**
 * Fetch grammar categories (levels): e.g. ['beginner','intermediate','advanced']
 */
export async function fetchGrammarCategories() {
  const res = await fetch('/api/grammar', { headers: buildHeaders() });
  if (!res.ok) throw new Error('Failed to fetch grammar categories');
  return await res.json();
}

/**
 * Fetch grammar lessons for a given level.
 */
export async function fetchGrammarLessons(level: string) {
  const res = await fetch(`/api/grammar/${encodeURIComponent(level)}`, { headers: buildHeaders() });
  if (!res.ok) throw new Error('Failed to fetch grammar lessons');
  return await res.json();
}

/**
 * Fetch a specific grammar lesson content.
 */
export async function fetchGrammarLesson(level: string, lessonId: string) {
  const res = await fetch(`/api/grammar/${encodeURIComponent(level)}/${encodeURIComponent(lessonId)}`, { headers: buildHeaders() });
  if (!res.ok) throw new Error('Failed to fetch grammar lesson');
  return await res.json();
}

export async function fetchSettings() {
  const res = await fetch('/api/settings', { headers: buildHeaders() });
  if (!res.ok) throw new Error('Failed to fetch settings');
  return await res.json();
}

export async function updateSettings(payload: Record<string, any>) {
  const res = await fetch('/api/settings', {
    method: 'POST',
    headers: buildHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to update settings');
  return await res.json();
}
