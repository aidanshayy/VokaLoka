// MatchCard.tsx
import React, { useState } from 'react';

const cardStyle: React.CSSProperties = {
  background: '#f9fbfd',
  borderRadius: 14,
  boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
  padding: '20px 24px',
  width: '100%',
  maxWidth: 420,
  margin: '0 auto',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
};

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
  gap: '14px',
  width: '100%',
  marginTop: '18px',
};

const itemStyle: React.CSSProperties = {
  padding: '14px 0',
  textAlign: 'center',
  borderRadius: '10px',
  border: '2px solid #b3c6e0',
  outline: '2.5px solid transparent',
  fontSize: '1rem',
  cursor: 'pointer',
  background: '#fff',
  transition: 'background 0.3s, color 0.3s, border 0.3s, outline 0.3s, box-shadow 0.3s',
  fontWeight: 500,
  boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
  userSelect: 'none' as const,
};

const titleStyle: React.CSSProperties = {
  fontSize: 22,
  fontWeight: 700,
  color: '#2a2a2a',
  marginBottom: 6,
  textAlign: 'center',
};

export default function MatchCard({ pairs, onNext }: any) {
  const [selected, setSelected] = useState<string[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [wrong, setWrong] = useState<string[]>([]);

  const allItems = [...pairs.map((p: any) => p.a), ...pairs.map((p: any) => p.b)].sort();

  const handleClick = (item: string) => {
    if (matched.includes(item) || selected.includes(item)) return;
    const updated = [...selected, item];
    setSelected(updated);

    if (updated.length === 2) {
      const [first, second] = updated;
      const isMatch = pairs.some(
        (p: any) => (p.a === first && p.b === second) || (p.a === second && p.b === first)
      );
      if (isMatch) {
        setTimeout(() => {
          setMatched(prev => [...prev, first, second]);
          setSelected([]);
          setWrong([]);
          if (matched.length + 2 === allItems.length) setTimeout(onNext, 400);
        }, 350);
      } else {
        setWrong([first, second]);
        setTimeout(() => {
          setSelected([]);
          setWrong([]);
        }, 700);
      }
    }
  };

  return (
    <div style={cardStyle}>
      <div style={titleStyle}>🔗 Match the Pairs</div>
      <div style={gridStyle}>
        {allItems.map(item => {
          // Determine state for styling
          const isMatched = matched.includes(item);
          const isSelected = selected.includes(item);
          const isWrong = wrong.includes(item);

          return (
            <div
              key={item}
              onClick={() => handleClick(item)}
              style={{
                ...itemStyle,
                background: isMatched
                  ? '#a5d6a7'
                  : isSelected
                  ? '#90caf9'
                  : isWrong
                  ? '#ffcdd2'
                  : '#fff',
                color: isMatched
                  ? '#2a2a2a'
                  : isSelected
                  ? '#fff'
                  : isWrong
                  ? '#b71c1c'
                  : '#2a2a2a',
                borderColor: isMatched
                  ? '#388e3c'
                  : isSelected
                  ? '#1976d2'
                  : isWrong
                  ? '#e53935'
                  : '#b3c6e0',
                outline: isSelected
                  ? '2.5px solid #1976d2'
                  : isMatched
                  ? '2.5px solid #388e3c'
                  : isWrong
                  ? '2.5px solid #e53935'
                  : '2.5px solid transparent',
                boxShadow: isSelected
                  ? '0 0 0 4px #bbdefb'
                  : isMatched
                  ? '0 0 0 4px #c8e6c9'
                  : isWrong
                  ? '0 0 0 4px #ffcdd2'
                  : '0 1px 6px rgba(0,0,0,0.04)',
                pointerEvents: isMatched ? 'none' : 'auto',
                transition:
                  'background 0.3s, color 0.3s, border 0.3s, outline 0.3s, box-shadow 0.3s',
              }}
            >
              {item}
            </div>
          );
        })}
      </div>
    </div>
  );
}

