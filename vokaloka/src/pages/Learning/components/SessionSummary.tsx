// SessionSummary.tsx
import React from 'react';

export default function SessionSummary({ words, category, onNext }: any) {
  return (
    <div style={styles.wrapper}>
      <h1 style={styles.title}>🚀 Today's Lesson</h1>
      <p style={styles.subtitle}>You'll be learning about: <strong>{category}</strong></p>
      <p style={styles.words}>📚 Words: {words.join(', ')}</p>
      <button style={styles.button} onClick={onNext}>Let’s Go!</button>
    </div>
  );
}

const styles = {
  wrapper: {
    height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #fbeaff, #d9e7ff)', textAlign: 'center' as const
  },
  title: { fontSize: '2.5rem', marginBottom: '10px', color: '#4a148c' },
  subtitle: { fontSize: '1.5rem', marginBottom: '20px', color: '#333' },
  words: { fontSize: '1.2rem', marginBottom: '40px' },
  button: { backgroundColor: '#4a90e2', color: '#fff', padding: '12px 28px', borderRadius: '8px', fontSize: '1rem', border: 'none', cursor: 'pointer' }
};
