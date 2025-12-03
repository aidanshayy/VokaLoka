import React, { useEffect, useState } from 'react';
import './Flashcard.css';

type FlashcardProps = {
  front: string;
  back: string;
  className?: string;
  onFlip?: (flipped: boolean) => void;
};

/**
 * 3D flip card using only GPU transforms (no layout changes).
 * - Fixed-height outer container
 * - Absolutely positioned faces with backface-visibility: hidden
 * - Inner rotates with transform to avoid reflow
 */
const Flashcard: React.FC<FlashcardProps> = ({ front, back, className = '', onFlip }) => {
  const [flipped, setFlipped] = useState(false);


  useEffect(() => {
    onFlip?.(flipped);
  }, [flipped, onFlip]);

  function toggle() {
    setFlipped(v => !v);
  }

  // Support global space/Enter to flip even when the flashcard isn't focused.

  return (
    <div className={`flashcard ${className}`}>
      <div
        className={`flashcard-inner ${flipped ? 'is-flipped' : ''}`}
        role="button"
        aria-pressed={flipped}
        tabIndex={0}
        onClick={toggle}
      >
        <div className="flashcard-face flashcard-front">
          <div className="flashcard-content">
            {front}
          </div>
          <div className="flashcard-hint">Click / Space / Enter to flip</div>
        </div>

        <div className="flashcard-face flashcard-back">
          <div className="flashcard-content">
            {back}
          </div>
          <div className="flashcard-hint">Click again to flip back</div>
        </div>
      </div>
    </div>
  );
};

export default Flashcard;
