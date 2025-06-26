import React from 'react';

export default function ExposeCard({ word, translation, image, note, example, translationExample, onNext }: any) {
  return (
    <div style={styles.wrapper}>
      <h2 style={styles.word}>{word}</h2>
      {image && <img src={image} alt={word} style={styles.image} />}
      <p><strong>Translation:</strong> {translation}</p>
      <p><strong>Note:</strong> {note}</p>
      <blockquote>🇵🇹 {example}</blockquote>
      <blockquote>🇺🇸 {translationExample}</blockquote>
      <button style={styles.button} onClick={onNext}>Next Word</button>
    </div>
  );
}

const styles = {
  wrapper: { minHeight: '100vh', padding: '20px', background: '#f5faff', display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', textAlign: 'center' as const },
  word: { fontSize: '2rem', marginBottom: '10px' },
  image: { width: '120px', height: '120px', objectFit: 'contain', marginBottom: '20px' },
  button: { marginTop: '20px', padding: '10px 20px', fontSize: '1rem', backgroundColor: '#0070f3', color: '#fff', border: 'none', borderRadius: '8px' }
};
