import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Flashcard from '../components/Flashcard';
import { fetchNextCard, submitReview } from '../services/api';
import './Review.css';

type Card = {
  id: string;
  question: string;
  answer: string;
};

const Review: React.FC = () => {
  const [sp] = useSearchParams();
  const deckId = useMemo(() => sp.get('deckId') || undefined, [sp]);

  const [card, setCard] = useState<Card | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  async function loadCard() {
    setLoading(true);
    try {
      const c = await fetchNextCard(deckId);
      setCard(c || null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deckId]);

  async function grade(quality: number) {
    if (!card || submitting) return;
    setSubmitting(true);
    try {
      await submitReview(card.id, quality);
      await loadCard();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="review-page">
      <h2>Review</h2>

      <div className="review-card-wrap">
        {loading ? (
          <div className="review-loading">Loading…</div>
        ) : card ? (
          <Flashcard front={card.question} back={card.answer} />
        ) : (
          <div className="review-empty">No cards due. 🎉</div>
        )}
      </div>

      <div className="review-actions">
        <button className="btn again" disabled={!card || submitting || loading} onClick={() => grade(0)}>Again</button>
        <button className="btn hard" disabled={!card || submitting || loading} onClick={() => grade(2)}>Hard</button>
        <button className="btn good" disabled={!card || submitting || loading} onClick={() => grade(3)}>Good</button>
        <button className="btn easy" disabled={!card || submitting || loading} onClick={() => grade(4)}>Easy</button>
      </div>
    </div>
  );
};

export default Review;
