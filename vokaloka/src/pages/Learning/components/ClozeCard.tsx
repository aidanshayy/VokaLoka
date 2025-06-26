// ClozeCard.tsx
import React, { useState } from 'react';

export default function ClozeCard({ sentence, translation, options, answer, onNext }: any) {
  const [selected, setSelected] = useState<string | null>(null);

  const handleClick = (opt: string) => {
    setSelected(opt);
    if (opt === answer) setTimeout(onNext, 1000);
  };

  return (
    <div style={styles.wrapper}>
      <h2>{sentence}</h2>
      <p style={{ color: '#777' }}>{translation}</p>
      <div style={styles.options}>
        {options.map((opt: string) => (
          <button
            key={opt}
            onClick={() => handleClick(opt)}
            style={{
              ...styles.option,
              backgroundColor: selected ? (opt === answer ? '#4caf50' : selected === opt ? '#e53935' : '#fff') : '#fff',
              color: selected && selected !== answer && selected === opt ? '#fff' : '#000',
            }}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

const styles = {
  wrapper: { height: '100vh', display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', background: '#f0f0f0', padding: '20px', textAlign: 'center' as const },
  options: { display: 'flex', flexWrap: 'wrap' as const, gap: '12px', marginTop: '20px' },
  option: { padding: '10px 18px', border: '2px solid #ccc', borderRadius: '8px', fontSize: '1rem', cursor: 'pointer' },
};