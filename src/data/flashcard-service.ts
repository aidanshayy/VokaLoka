/*
 * FlashcardService provides a minimal persistence layer for storing and
 * retrieving flashcard data in a JSON file. It defines a user-specific
 * deck, applies a daily new card limit, and handles basic CRUD operations
 * on flashcards. When migrating to SQL this module will likely be
 * replaced by database queries, but keeping the API stable will ease
 * migration.
 */

import * as fs from 'fs';
import * as path from 'path';
import { SRS_CONFIG } from '@/src/lib/config';

// --- TYPE DEFINITIONS ---
// Dates are stored as ISO strings in JSON, but hydrated to Date objects in memory.
export interface FlashcardData {
  id: string;
  userId: string;
  front: string;
  back: string;
  createdAt: Date;
  updatedAt: Date;
  lastReviewDate: Date;
  nextReviewDate: Date;
  interval: number;
  repetitionCount: number; // 0 means "New"
  easeFactor: number;
}

// JSON storage format uses strings for dates
type FlashcardRecord = Omit<
  FlashcardData,
  'createdAt' | 'updatedAt' | 'lastReviewDate' | 'nextReviewDate'
> & {
  createdAt: string;
  updatedAt: string;
  lastReviewDate: string;
  nextReviewDate: string;
};

// --- MASTER DECK DEFINITION (core Portuguese vocabulary) ---
const MASTER_DECK: Array<{ front: string; back: string }> = [
  { front: 'Hello', back: 'Olá' },
  { front: 'Thank you', back: 'Obrigado / Obrigada' },
  { front: 'Please', back: 'Por favor' },
  { front: 'Good morning', back: 'Bom dia' },
  { front: 'Good night', back: 'Boa noite' },
  { front: 'Yes', back: 'Sim' },
  { front: 'No', back: 'Não' },
  { front: 'Excuse me', back: 'Com licença' },
  { front: 'Where is the bathroom?', back: 'Onde é o banheiro?' },
  { front: 'I need help', back: 'Eu preciso de ajuda' },
];

// Path to our JSON database file
const DB_FILE_PATH = path.resolve(process.cwd(), 'src', 'data', 'cards.json');

// --- FILE HELPERS ---

function ensureDbFile(): void {
  const dir = path.dirname(DB_FILE_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DB_FILE_PATH)) fs.writeFileSync(DB_FILE_PATH, '[]', 'utf-8');
}

function safeDate(value: any, fallback: Date): Date {
  const d = new Date(value);
  return Number.isFinite(d.getTime()) ? d : fallback;
}

function hydrateRecord(r: any): FlashcardData | null {
  if (!r || typeof r !== 'object') return null;
  if (typeof r.id !== 'string' || typeof r.userId !== 'string') return null;
  if (typeof r.front !== 'string' || typeof r.back !== 'string') return null;
  const now = new Date();
  const repetitionCount = typeof r.repetitionCount === 'number' && Number.isFinite(r.repetitionCount) ? r.repetitionCount : 0;
  const interval = typeof r.interval === 'number' && Number.isFinite(r.interval) ? r.interval : 0;
  const easeFactor = typeof r.easeFactor === 'number' && Number.isFinite(r.easeFactor) ? r.easeFactor : 2.5;
  const createdAt = safeDate(r.createdAt, now);
  const updatedAt = safeDate(r.updatedAt, now);
  const lastReviewDate = safeDate(r.lastReviewDate, now);
  const nextReviewDate = safeDate(r.nextReviewDate, now);
  return {
    id: r.id,
    userId: r.userId,
    front: r.front,
    back: r.back,
    createdAt,
    updatedAt,
    lastReviewDate,
    nextReviewDate,
    interval,
    repetitionCount,
    easeFactor,
  };
}

function serializeCard(c: FlashcardData): FlashcardRecord {
  return {
    id: c.id,
    userId: c.userId,
    front: c.front,
    back: c.back,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
    lastReviewDate: c.lastReviewDate.toISOString(),
    nextReviewDate: c.nextReviewDate.toISOString(),
    interval: c.interval,
    repetitionCount: c.repetitionCount,
    easeFactor: c.easeFactor,
  };
}

/** Read all cards from the JSON file, hydrating dates */
const readCardsFromFile = (): FlashcardData[] => {
  try {
    ensureDbFile();
    const fileContent = fs.readFileSync(DB_FILE_PATH, 'utf-8');
    const raw = JSON.parse(fileContent);
    if (!Array.isArray(raw)) return [];
    const hydrated: FlashcardData[] = [];
    for (const r of raw) {
      const card = hydrateRecord(r);
      if (card) hydrated.push(card);
    }
    return hydrated;
  } catch (error) {
    console.error('Error reading/parsing card data. Check if src/data/cards.json is valid JSON:', error);
    return [];
  }
};

/** Write the card array back to the JSON file atomically */
const writeCardsToFile = (cards: FlashcardData[]): void => {
  try {
    ensureDbFile();
    const jsonContent = JSON.stringify(cards.map(serializeCard), null, 2);
    const tmpPath = `${DB_FILE_PATH}.tmp`;
    fs.writeFileSync(tmpPath, jsonContent, 'utf-8');
    fs.renameSync(tmpPath, DB_FILE_PATH);
  } catch (error) {
    console.error('Error writing card data:', error);
  }
};

// --- FLASHCARD SERVICE ---

export const FlashcardService = {
  /** Return all cards for a user */
  getCardsForUser(userId: string): FlashcardData[] {
    const cards = readCardsFromFile();
    return cards.filter((c) => c.userId === userId);
  },
  /** Return total number of cards for a user (detect first run) */
  getTotalCardsForUser(userId: string): number {
    return this.getCardsForUser(userId).length;
  },
  /**
   * Get a prioritized list of cards due for review. New cards are limited
   * by the daily new card limit. Review cards are sorted by how overdue they
   * are (older nextReviewDate first) and new cards by creation date.
   */
  getCardsDueForUser(userId: string): FlashcardData[] {
    const cards = readCardsFromFile();
    const now = new Date();
    const userCards = cards.filter((card) => card.userId === userId);
    const reviewCards: FlashcardData[] = [];
    const newCards: FlashcardData[] = [];
    for (const card of userCards) {
      if (card.repetitionCount > 0) {
        if (card.nextReviewDate <= now) reviewCards.push(card);
      } else {
        newCards.push(card);
      }
    }
    // Sort review cards by most overdue first
    reviewCards.sort((a, b) => a.nextReviewDate.getTime() - b.nextReviewDate.getTime());
    // Sort new cards by creation date to ensure stable order
    newCards.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    const newCardsLimit = Number.isFinite(SRS_CONFIG.DAILY_NEW_CARD_LIMIT) ? SRS_CONFIG.DAILY_NEW_CARD_LIMIT : 2;
    const limit = Math.max(0, Math.floor(newCardsLimit));
    // Log for debug
    console.log(
      `[FlashcardService] user=${userId} dueReviews=${reviewCards.length} newUnseen=${newCards.length} newLimit=${limit}`
    );
    const limitedNewCards = newCards.slice(0, limit);
    return [...reviewCards, ...limitedNewCards];
  },
  /**
   * Initialize the complete flashcard deck for a user. This is idempotent: if
   * the user already has cards, no new cards are added. Cards are given
   * stable IDs so that re-initialization yields the same IDs. New cards are
   * immediately due (nextReviewDate = now).
   */
  initializeUserDeck(userId: string): FlashcardData[] {
    const allCards = readCardsFromFile();
    const existingUserCards = allCards.filter((c) => c.userId === userId);
    if (existingUserCards.length > 0) {
      return existingUserCards;
    }
    const now = new Date();
    const newCards: FlashcardData[] = MASTER_DECK.map((card, index) => ({
      id: `${userId}-master-${index}`,
      userId,
      front: card.front,
      back: card.back,
      createdAt: now,
      updatedAt: now,
      lastReviewDate: now,
      nextReviewDate: now,
      interval: 0,
      repetitionCount: 0,
      easeFactor: 2.5,
    }));
    allCards.push(...newCards);
    writeCardsToFile(allCards);
    console.log(`[FlashcardService] Initialized deck for user=${userId} cards=${newCards.length}`);
    return newCards;
  },
  /**
   * Update an existing card and persist the change. nextReviewDate and other
   * fields must already be normalized by the SRS logic. updatedAt is set to
   * now to ensure ordering consistency.
   */
  updateCard(updatedCard: FlashcardData): FlashcardData {
    const cards = readCardsFromFile();
    const index = cards.findIndex((c) => c.id === updatedCard.id);
    if (index === -1) {
      throw new Error(`Card with ID ${updatedCard.id} not found.`);
    }
    const now = new Date();
    const normalized: FlashcardData = {
      ...updatedCard,
      updatedAt: now,
      createdAt: safeDate(updatedCard.createdAt, now),
      lastReviewDate: safeDate(updatedCard.lastReviewDate, now),
      nextReviewDate: safeDate(updatedCard.nextReviewDate, now),
    };
    cards[index] = normalized;
    writeCardsToFile(cards);
    return normalized;
  },
  /** Helper to get a card by ID. */
  getCardById(cardId: string): FlashcardData | undefined {
    const cards = readCardsFromFile();
    return cards.find((c) => c.id === cardId);
  },
};