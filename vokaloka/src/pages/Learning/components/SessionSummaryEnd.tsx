// SessionSummaryEnd.tsx
import React from 'react';

export default function SessionSummaryEnd({ words, onDone }: any) {
  return (
    <div style={styles.wrapper}>
      <h1 style={styles.title}>🎉 Great Job!</h1>
      <p style={styles.subtitle}>You’ve just learned:</p>
      <ul style={styles.list}>
        {words.map((word: string, i: number) => (
          <li key={i}>{word}</li>
        ))}
      </ul>
      <button style={styles.button} onClick={onDone}>Return to Dashboard</button>
    </div>
  );
}

const styles = {
  wrapper: { height: '100vh', background: 'linear-gradient(135deg, #e0ffe0, #d0f0ff)', display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', padding: '20px' },
  title: { fontSize: '2.5rem', color: '#388e3c' },
  subtitle: { margin: '20px 0', fontSize: '1.2rem' },
  list: { listStyle: 'none', padding: 0, marginBottom: '30px' },
  button: { padding: '12px 28px', backgroundColor: '#0070f3', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '1rem', cursor: 'pointer' }
};

