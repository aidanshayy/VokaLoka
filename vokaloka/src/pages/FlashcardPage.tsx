import { useState } from 'react';

export default function FlashcardPage() {
  const [flipped, setFlipped] = useState(false);

  const handleCardClick = () => {
    setFlipped(!flipped);
  };

  return (
    <div style={styles.wrapper}>
      <h1 style={styles.title}>🧠 Flashcard Review</h1>

      <div style={styles.cardContainer} onClick={handleCardClick}>
        <div
          style={{
            ...styles.card,
            transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          <div style={{ ...styles.cardFace, ...styles.front }}>
            <p style={styles.cardText}>What is the Portuguese word for "dog"?</p>
          </div>
          <div style={{ ...styles.cardFace, ...styles.back }}>
            <p style={styles.cardText}>Cachorro 🐶</p>
          </div>
        </div>
      </div>

      <div style={styles.buttons}>
        <button style={styles.again}>Again</button>
        <button style={styles.good}>Good</button>
        <button style={styles.perfect}>Perfect</button>
      </div>
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
    background: 'linear-gradient(135deg, #f9f9f9, #e0f7fa)',
    fontFamily: 'Helvetica, Arial, sans-serif',
    padding: '20px',
  },
  title: {
    fontSize: '2rem',
    marginBottom: '40px',
    color: '#333',
  },
  cardContainer: {
    width: '300px',
    height: '200px',
    perspective: '1000px',
    marginBottom: '40px',
  },
  card: {
    width: '100%',
    height: '100%',
    position: 'relative' as const,
    transition: 'transform 0.6s',
    transformStyle: 'preserve-3d' as const,
    cursor: 'pointer',
  },
  cardFace: {
    position: 'absolute' as const,
    width: '100%',
    height: '100%',
    backfaceVisibility: 'hidden' as const,
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.2rem',
    padding: '20px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  },
  front: {
    backgroundColor: '#ffffff',
  },
  back: {
    backgroundColor: '#d0f0c0',
    transform: 'rotateY(180deg)',
  },
  cardText: {
    textAlign: 'center' as const,
  },
  buttons: {
    display: 'flex',
    gap: '20px',
  },
  again: {
    backgroundColor: '#ff4d4f',
    color: '#fff',
    padding: '12px 20px',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    cursor: 'pointer',
  },
  good: {
    backgroundColor: '#fadb14',
    color: '#000',
    padding: '12px 20px',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    cursor: 'pointer',
  },
  perfect: {
    backgroundColor: '#52c41a',
    color: '#fff',
    padding: '12px 20px',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    cursor: 'pointer',
  },
};
