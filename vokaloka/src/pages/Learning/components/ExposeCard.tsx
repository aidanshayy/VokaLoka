import React from 'react';

interface ExposeCardProps {
  word: {
    name: string;
    translation: string;
    note: string;
    targetSentence: string;
    nativeSentence: string;
  };
  onNext: () => void;
}

// Unified card style for consistency with SessionSummary and other cards
const cardStyle: React.CSSProperties = {
  background: '#f9fbfd', // Change this to adjust the card's background
  borderRadius: 14,
  boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
  padding: '20px 28px',
  width: '100%',
  maxWidth: 420,
  margin: '0 auto',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
};

const wordStyle: React.CSSProperties = {
  fontSize: 26,
  fontWeight: 700,
  marginBottom: 10,
  color: '#2a2a2a',
  textAlign: 'center',
};

const contentStyle: React.CSSProperties = {
  fontSize: 16,
  color: '#444',
  marginBottom: 18,
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
};

const labelStyle: React.CSSProperties = {
  fontWeight: 600,
  color: '#3a7bd5',
  marginRight: 4,
};

const buttonStyle: React.CSSProperties = {
  marginTop: 8,
  padding: '10px 28px',
  background: 'linear-gradient(90deg, #4f8cff 0%, #38e8ff 100%)',
  color: '#fff',
  border: 'none',
  borderRadius: 8,
  fontWeight: 600,
  fontSize: 16,
  cursor: 'pointer',
  transition: 'background 0.2s',
  alignSelf: 'center',
};

const ExposeCard: React.FC<ExposeCardProps> = ({ word, onNext }) => {
  return (
    <div style={cardStyle}>
      <div style={wordStyle}>📖 {word.name}</div>
      <div style={contentStyle}>
        <div>
          <span style={labelStyle}>Translation:</span>
          {word.translation}
        </div>
        <div>
          <span style={labelStyle}>Note:</span>
          {word.note}
        </div>
        <div>
          <span style={labelStyle}>Example:</span>
          {word.targetSentence}
        </div>
        <div>
          <span style={labelStyle}>English:</span>
          {word.nativeSentence}
        </div>
      </div>
      <button style={buttonStyle} onClick={onNext}>
        Next Word
      </button>
    </div>
  );
};

export default ExposeCard;
