/*
 * Simplified SM-2 spaced repetition algorithm. This implementation maps
 * simplified quality values ('AGAIN', 'GOOD', 'EASY') onto SM-2 quality
 * scores (0, 3, 5) and calculates the next review interval, repetition
 * count, and ease factor for a given card. The algorithm is designed to be
 * easy to reason about and modifiable for experimenting with different
 * scheduling strategies.
 */

import { FlashcardData } from '@/src/data/flashcard-service';
import { FlashcardService } from '@/src/data/flashcard-service';

// --- TYPE DEFINITIONS ---
export type SimplifiedQuality = 'AGAIN' | 'GOOD' | 'EASY';

export interface CalculatedSRSData {
  nextReviewDate: Date;
  interval: number;
  repetitionCount: number;
  easeFactor: number;
}

// --- HELPER MAPPING ---
const mapSimplifiedToSM2Quality = (simplified: SimplifiedQuality): 0 | 3 | 5 => {
  switch (simplified) {
    case 'AGAIN':
      return 0;
    case 'GOOD':
      return 3;
    case 'EASY':
      return 5;
    default:
      throw new Error(`Invalid simplified quality: ${simplified}`);
  }
};

// --- CORE SRS LOGIC (Simplified SM-2 Implementation) ---
export const calculateNextSRSState = (
  card: FlashcardData,
  simplifiedQuality: SimplifiedQuality
): CalculatedSRSData => {
  const quality = mapSimplifiedToSM2Quality(simplifiedQuality);
  let newEaseFactor = card.easeFactor;
  let newRepetitionCount = card.repetitionCount;
  let newInterval = card.interval;
  // Adjust ease factor
  if (quality === 0) newEaseFactor -= 0.32;
  else if (quality === 3) newEaseFactor -= 0.16;
  else if (quality === 5) newEaseFactor += 0.10;
  if (newEaseFactor < 1.3) newEaseFactor = 1.3;
  const now = new Date();
  // AGAIN = keep due today (nextReviewDate = now), but do not artificially
  // bubble it to the top of the queue. This ensures spacing behavior is
  // controlled by the UI logic rather than the SRS internals.
  if (quality < 3) {
    newRepetitionCount = card.repetitionCount;
    newInterval = 0;
    const nextReviewDate = new Date(now);
    return {
      nextReviewDate,
      interval: newInterval,
      repetitionCount: newRepetitionCount,
      easeFactor: newEaseFactor,
    };
  }
  // GOOD/EASY = successful review -> schedule into the future
  newRepetitionCount = card.repetitionCount + 1;
  if (newRepetitionCount === 1) newInterval = 1;
  else if (newRepetitionCount === 2) newInterval = 6;
  else newInterval = Math.round(card.interval * newEaseFactor);
  if (quality === 5) {
    newInterval = Math.round(newInterval * 1.5);
  }
  const nextReviewDate = new Date(now);
  nextReviewDate.setDate(now.getDate() + newInterval);
  return {
    nextReviewDate,
    interval: newInterval,
    repetitionCount: newRepetitionCount,
    easeFactor: newEaseFactor,
  };
};

// --- INTEGRATION WITH SERVICE LAYER ---
export const processReview = async (cardId: string, simplifiedQuality: SimplifiedQuality): Promise<FlashcardData> => {
  const currentCard = FlashcardService.getCardById(cardId);
  if (!currentCard) {
    throw new Error(`Card with ID ${cardId} not found during review.`);
  }
  const srsData = calculateNextSRSState(currentCard, simplifiedQuality);
  const updatedCard: FlashcardData = {
    ...currentCard,
    ...srsData,
    lastReviewDate: new Date(),
  };
  const savedCard = FlashcardService.updateCard(updatedCard);
  return savedCard;
};