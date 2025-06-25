import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const newCards = [
  { question: "What is 'apple' in Portuguese?", answer: 'Maçã 🍎' },
  { question: "What is 'bread' in Portuguese?", answer: 'Pão 🍞' },
  { question: "What is 'car' in Portuguese?", answer: 'Carro 🚗' },
  { question: "What is 'house' in Portuguese?", answer: 'Casa 🏠' },
  { question: "What is 'water' in Portuguese?", answer: 'Água 💧' },
];

export default function NewCardsPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [finished, setFinished] = useState(false);
  const navigate = useNavigate();

  const handleFlip = () => setShowAnswer(true);
  const handleNext = () => {
    if (currentIndex < newCards.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setShowAnswer(false);
    } else {
      setFinished(true);
    }
  };

  return (
    <div style={styles.wrapper}>
      <h1 style={styles.title}>📘 Learn New Words</h1>

      {finished ? (
        <div style={styles.card}>
          <h2 style={styles.text}>🎉 You’ve finished your new words for today!</h2>
          <button style={styles.button} onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
        </div>
      ) : (
        <div style={styles.card} onClick={handleFlip}>
          <p style={styles.text}>
            {showAnswer ? newCards[currentIndex].answer : newCards[currentIndex].question}
          </p>
          {showAnswer && <button style={styles.button} onClick={handleNext}>Next</button>}
        </div>
      )}
    </div>
  );
}

const styles = {
  wrapper: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #d0eaff, #f9faff)',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    fontFamily: 'Helvetica, Arial, sans-serif',
  },
  title: {
    fontSize: '2rem',
    marginBottom: '30px',
    color: '#333',
  },
  card: {
    background: '#fff',
    padding: '40px',
    borderRadius: '12px',
    boxShadow: '0 6px 20px rgba(0,0,0,0.1)',
    width: '90%',
    maxWidth: '400px',
    textAlign: 'center' as const,
  },
  text: {
    fontSize: '1.4rem',
    marginBottom: '20px',
    color: '#333',
  },
  button: {
    padding: '12px 24px',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    backgroundColor: '#0070f3',
    color: '#fff',
    cursor: 'pointer',
  },
};
