// MatchCard.tsx
import React, { useState } from 'react';

export default function MatchCard({ pairs, onNext }: any) {
  const [selected, setSelected] = useState<string[]>([]);
  const [matched, setMatched] = useState<string[]>([]);

  const allItems = [...pairs.map(p => p.a), ...pairs.map(p => p.b)].sort();

  const handleClick = (item: string) => {
    if (matched.includes(item) || selected.includes(item)) return;
    const updated = [...selected, item];
    setSelected(updated);

    if (updated.length === 2) {
      const [first, second] = updated;
      const isMatch = pairs.some(p => (p.a === first && p.b === second) || (p.a === second && p.b === first));
      if (isMatch) {
        setMatched([...matched, first, second]);
        setSelected([]);
        if (matched.length + 2 === allItems.length) setTimeout(onNext, 500);
      } else {
        setTimeout(() => setSelected([]), 600);
      }
    }
  };

  return (
    <div style={styles.wrapper}>
      <h2>🔗 Match the Pairs</h2>
      <div style={styles.grid}>
        {allItems.map(item => (
          <div
            key={item}
            onClick={() => handleClick(item)}
            style={{
              ...styles.card,
              backgroundColor: matched.includes(item) ? '#a5d6a7' : selected.includes(item) ? '#90caf9' : '#fff',
              cursor: matched.includes(item) ? 'default' : 'pointer'
            }}
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  wrapper: { height: '100vh', display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', padding: '20px', background: '#fffde7' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '12px', width: '100%', maxWidth: '400px', marginTop: '20px' },
  card: { padding: '12px', textAlign: 'center' as const, borderRadius: '8px', border: '1px solid #ccc' },
};

