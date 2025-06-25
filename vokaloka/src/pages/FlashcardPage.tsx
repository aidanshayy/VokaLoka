import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const mockCards = [
  { question: "What is the Portuguese word for 'dog'?", answer: 'Cachorro 🐶' },
  { question: "What is the Portuguese word for 'cat'?", answer: 'Gato 🐱' },
  { question: "What is the Portuguese word for 'hello'?", answer: 'Olá 👋' },
];

export default function FlashcardPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const navigate = useNavigate();

  const totalCards = mockCards.length;
  const progress = currentIndex / totalCards;
  const currentCard = mockCards[currentIndex];

  const handleCardClick = () => {
    setShowAnswer(true);
  };

  const handleReview = () => {
    if (currentIndex < totalCards - 1) {
      setCurrentIndex((prev) => prev + 1);
      setShowAnswer(false);
    } else {
      setFadeOut(true);
      setTimeout(() => {
        setIsFinished(true);
      }, 500);
    }
  };

  return (
    <div style={styles.wrapper}>
      <h1 style={styles.title}>🧠 Flashcard Review</h1>

      {isFinished ? (
        <div style={styles.finishedBox}>
          <div style={styles.finishedContent}>
            <h2 style={styles.finishedText}>🎉 You’ve completed your reviews for today!</h2>
            <button style={styles.exitButton} onClick={() => navigate('/dashboard')}>
              Return to Dashboard
            </button>
          </div>
        </div>
      ) : (
        <div
          style={{
            opacity: fadeOut ? 0 : 1,
            transition: 'opacity 1s ease-in-out',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <div style={styles.card}>
            <div style={styles.progressBarWrapper}>
              <div style={{ ...styles.progressBarFill, width: `${progress * 100}%` }}></div>
            </div>

            <div style={styles.cardContent} onClick={handleCardClick}>
              <div
                style={{
                  ...styles.question,
                  transform: showAnswer ? 'translateY(-20px)' : 'translateY(0)',
                  transition: 'transform 0.3s ease',
                }}
              >
                <p style={styles.cardText}>{currentCard.question}</p>
              </div>

              <div
                style={{
                  ...styles.answer,
                  transform: showAnswer ? 'translateY(0)' : 'translateY(100%)',
                  opacity: showAnswer ? 1 : 0,
                }}
              >
                <p style={styles.cardText}>{currentCard.answer}</p>
              </div>
            </div>
          </div>

          <div style={styles.buttonContainer}>
            {showAnswer ? (
              <div style={styles.buttons}>
                <button style={styles.again} onClick={handleReview}>Again</button>
                <button style={styles.good} onClick={handleReview}>Good</button>
                <button style={styles.perfect} onClick={handleReview}>Perfect</button>
              </div>
            ) : (
              <div style={{ height: '60px' }}></div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  wrapper: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #a8edea, #fed6e3)',
    fontFamily: 'Helvetica, Arial, sans-serif',
    padding: '20px',
  },
  title: {
    fontSize: '2.5rem',
    marginBottom: '40px',
    color: '#333',
  },
  card: {
    width: '400px',
    height: '300px',
    borderRadius: '16px',
    backgroundColor: '#ffffff',
    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'space-between',
    position: 'relative' as const,
    overflow: 'hidden',
    marginBottom: '30px',
  },
  progressBarWrapper: {
    width: '100%',
    height: '8px',
    backgroundColor: '#e0e0e0',
    borderRadius: '4px',
    marginBottom: '12px',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#0070f3',
    transition: 'width 0.3s ease-in-out',
  },
  cardContent: {
    flex: 1,
    position: 'relative' as const,
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'space-between',
    height: '100%',
    overflow: 'hidden',
    cursor: 'pointer',
  },
  question: {
    height: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.4rem',
    textAlign: 'center' as const,
    color: '#333',
    padding: '10px',
    zIndex: 1,
  },
  answer: {
    height: '50%',
    backgroundColor: '#ffffff',
    borderTop: '1px solid #ccc',
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center' as const,
    fontSize: '1.4rem',
    transition: 'transform 0.5s ease, opacity 0.5s ease',
    zIndex: 2,
  },
  cardText: {
    margin: 0,
  },
  buttonContainer: {
    height: '60px',
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
  },
  buttons: {
    backgroundColor: '#ffffff',
    padding: '16px',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    display: 'flex',
    justifyContent: 'center',
    gap: '12px',
    alignItems: 'center',
  },
  again: {
    backgroundColor: '#ff4d4f',
    color: '#fff',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    cursor: 'pointer',
  },
  good: {
    backgroundColor: '#fadb14',
    color: '#000',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    cursor: 'pointer',
  },
  perfect: {
    backgroundColor: '#52c41a',
    color: '#fff',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    cursor: 'pointer',
  },
  finishedBox: {
    width: '400px',
    height: '300px',
    borderRadius: '16px',
    backgroundColor: '#ffffff',
    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    animation: 'fadeSlide 1s ease forwards',
  },
  finishedContent: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center' as const,
  },
  finishedText: {
    fontSize: '1.6rem',
    color: '#0070f3',
  },
  exitButton: {
    marginTop: '20px',
    backgroundColor: '#0070f3',
    color: '#fff',
    padding: '12px 24px',
    fontSize: '1rem',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    transition: 'background 0.3s ease',
  },
};

