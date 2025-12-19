/*
 * Server actions that mediate between the client-side review flow and the
 * underlying flashcard data and SRS scheduling logic. These functions
 * encapsulate the persistence layer and handle the conversion of date
 * objects into ISO strings for serialization.
 */
'use server';

import { FlashcardData } from '@/src/data/flashcard-service';
import { FlashcardService } from '@/src/data/flashcard-service';
import { processReview, SimplifiedQuality } from '@/src/lib/srs';

// A mock user ID for the current session. In a multi-user system this
// would be derived from authentication, but for the purposes of this
// prototype we only support a single test user.
const MOCK_USER_ID = 'user-001-test';

// A DTO for serializing flashcards. nextReviewDate must be an ISO string
export type FlashcardDTO = Omit<FlashcardData, 'nextReviewDate'> & {
  nextReviewDate: string;
};

// Convert a FlashcardData into a DTO with an ISO nextReviewDate
function toDTO(card: FlashcardData): FlashcardDTO {
  const d = card.nextReviewDate instanceof Date ? card.nextReviewDate : new Date(card.nextReviewDate as any);
  return {
    ...card,
    nextReviewDate: d.toISOString(),
  };
}

/**
 * Fetch the next card due for review for the current user. Cards can be
 * excluded (e.g. the AGAIN queue) and an optional includeIds list will
 * restrict the results to only those IDs (used when focusing on the
 * again queue during the reinforcement phase).
 */
export async function getNextCardForReview(
  excludeIds: string[] = [],
  includeIds?: string[]
): Promise<FlashcardDTO | null> {
  try {
    FlashcardService.initializeUserDeck(MOCK_USER_ID);
    const dueCards = FlashcardService.getCardsDueForUser(MOCK_USER_ID);
    if (dueCards.length === 0) return null;
    const exclude = new Set(excludeIds);
    const include = includeIds ? new Set(includeIds) : null;
    const next = dueCards.find((c) => {
      if (exclude.has(c.id)) return false;
      if (include && !include.has(c.id)) return false;
      return true;
    }) ?? null;
    return next ? toDTO(next) : null;
  } catch (e) {
    console.error('Error fetching next card:', e);
    return null;
  }
}

/**
 * Submit a card review with the given quality. This delegates to the SM-2
 * algorithm implementation and persists the updated card data.
 */
export async function submitCardReview(cardId: string, quality: SimplifiedQuality): Promise<FlashcardDTO> {
  try {
    const updatedCard = await processReview(cardId, quality);
    return toDTO(updatedCard);
  } catch (e) {
    console.error('Error submitting card review:', e);
    throw new Error('Failed to submit review. Check server logs.');
  }
}