// ClozeCard.tsx
import React, { useState } from 'react';

const cardStyle: React.CSSProperties = {
  background: '#f9fbfd',
  borderRadius: 14,
  boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
  padding: '20px 24px',
  width: '100%',
  maxWidth: 400,
  margin: '0 auto',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
};

const sentenceStyle: React.CSSProperties = {
  fontSize: 22,
  fontWeight: 700,
  color: '#2a2a2a',
  marginBottom: 8,
  textAlign: 'center',
};

const translationStyle: React.CSSProperties = {
  color: '#777',
  fontSize: 15,
  marginBottom: 18,
  textAlign: 'center',
};

const optionsStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '12px',
  marginTop: '10px',
  justifyContent: 'center',
  width: '100%',
};

const optionButtonStyle: React.CSSProperties = {
  padding: '10px 18px',
  border: '2px solid #b3c6e0',
  borderRadius: '8px',
  fontSize: '1rem',
  cursor: 'pointer',
  background: '#fff',
  fontWeight: 500,
  transition: 'background 0.2s, color 0.2s, border 0.2s',
};

export default function ClozeCard({ sentence, translation, options, answer, onNext }: any) {
  const [wrongSelections, setWrongSelections] = useState<string[]>([]);
  const [correct, setCorrect] = useState<string | null>(null);

  const handleClick = (opt: string) => {
    if (correct) return; // If already correct, do nothing
    if (opt === answer) {
      setCorrect(opt);
      setTimeout(onNext, 1000);
    } else if (!wrongSelections.includes(opt)) {
      setWrongSelections(prev => [...prev, opt]);
    }
  };

  return (
    <div style={cardStyle}>
      <div style={sentenceStyle}>{sentence}</div>
      <div style={translationStyle}>{translation}</div>
      <div style={optionsStyle}>
        {options.map((opt: string) => (
          <button
            key={opt}
            onClick={() => handleClick(opt)}
            style={{
              ...optionButtonStyle,
              background:
                correct === opt
                  ? '#4caf50'
                  : wrongSelections.includes(opt)
                  ? '#e53935'
                  : '#fff',
              color:
                correct === opt
                  ? '#fff'
                  : wrongSelections.includes(opt)
                  ? '#fff'
                  : '#2a2a2a',
              borderColor:
                correct === opt
                  ? '#388e3c'
                  : wrongSelections.includes(opt)
                  ? '#b71c1c'
                  : '#b3c6e0',
              pointerEvents: correct ? 'none' : wrongSelections.includes(opt) ? 'none' : 'auto',
              opacity: correct && correct !== opt ? 0.7 : 1,
            }}
            disabled={!!correct || wrongSelections.includes(opt)}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}