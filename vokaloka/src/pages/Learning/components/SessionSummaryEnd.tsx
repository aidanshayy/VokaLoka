// SessionSummaryEnd.tsx
import React from 'react';

const cardStyle: React.CSSProperties = {
  background: '#f9fbfd',
  borderRadius: 14,
  boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
  padding: '24px 28px',
  width: '100%',
  maxWidth: 400,
  margin: '0 auto',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
};

const titleStyle: React.CSSProperties = {
  fontSize: 28,
  fontWeight: 700,
  color: '#388e3c',
  marginBottom: 8,
  textAlign: 'center',
};

const subtitleStyle: React.CSSProperties = {
  margin: '12px 0 18px 0',
  fontSize: 17,
  color: '#444',
  textAlign: 'center',
};

const listStyle: React.CSSProperties = {
  listStyle: 'none',
  padding: 0,
  marginBottom: 24,
  fontSize: 18,
  color: '#2a2a2a',
  textAlign: 'center',
};

const buttonStyle: React.CSSProperties = {
  padding: '10px 28px',
  background: 'linear-gradient(90deg, #4f8cff 0%, #38e8ff 100%)',
  color: '#fff',
  border: 'none',
  borderRadius: 8,
  fontWeight: 600,
  fontSize: 16,
  cursor: 'pointer',
  transition: 'background 0.2s',
};

export default function SessionSummaryEnd({ words, onDone }: any) {
  return (
    <div style={cardStyle}>
      <div style={titleStyle}>🎉 Great Job!</div>
      <div style={subtitleStyle}>You’ve just learned:</div>
      <ul style={listStyle}>
        {words.map((word: string, i: number) => (
          <li key={i}>{word}</li>
        ))}
      </ul>
      <button style={buttonStyle} onClick={onDone}>Return to Dashboard</button>
    </div>
  );
}

