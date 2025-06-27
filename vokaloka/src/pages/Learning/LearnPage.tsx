import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import SessionSummary from './components/SessionSummary';
import ExposeCard from './components/ExposeCard';
import ClozeCard from './components/ClozeCard';
import MatchCard from './components/MatchCard';
import SessionSummaryEnd from './components/SessionSummaryEnd';

const sessionSteps = [
  {
    type: 'summary',
    words: ['Maçã', 'Pão', 'Carro'],
    category: 'Food and Everyday Items',
  },
  {
    type: 'expose',
    word: {
      name: 'Maçã 🍎',
      translation: 'Apple',
      note: 'Feminine noun: a maçã',
      targetSentence: 'Eu gosto de comer uma maçã de manhã.',
      nativeSentence: 'I like to eat apples in the morning.',
    },
  },
  {
    type: 'expose',
    word: {
      name: 'Pão 🍞',
      translation: 'Bread',
      note: 'Masculine noun: o pão',
      targetSentence: 'Ela comprou pão fresco na padaria.',
      nativeSentence: 'She bought fresh bread at the bakery.',
    },
  },
  {
    type: 'expose',
    word: {
      name: 'Carro 🚗',
      translation: 'Car',
      note: 'Masculine noun: o carro',
      targetSentence: 'O carro está estacionado na rua.',
      nativeSentence: 'The car is parked on the street.',
    },
  },
  {
    type: 'cloze',
    sentence: 'O ____ é muito gostoso.',
    translation: 'The bread is very tasty.',
    options: ['Carro', 'Maçã', 'Pão', 'Gato'],
    answer: 'Pão',
  },
  {
    type: 'match',
    pairs: [
      { a: 'Apple', b: 'Maçã' },
      { a: 'Bread', b: 'Pão' },
      { a: 'Car', b: 'Carro' },
    ],
  },
  {
    type: 'summary-end',
    reviewWords: ['Maçã', 'Pão', 'Carro'],
  },
];

export default function LearnPage() {
  const [stepIndex, setStepIndex] = useState(0);
  const navigate = useNavigate();

  const current = sessionSteps[stepIndex];

  const handleNext = () => {
    if (stepIndex < sessionSteps.length - 1) {
      setStepIndex((prev) => prev + 1);
    }
  };

  const progress = ((stepIndex + 1) / sessionSteps.length) * 100;

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '10px 10px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 560,
          background: '#e0f7fa', // 🔵 updated background color
          borderRadius: 18,
          boxShadow: '0 4px 24px rgba(26, 24, 24, 0.1)',
          padding: '36px 36px 36px 36px',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* Progress Bar */}
        <div style={{ width: '100%', marginBottom: 24 }}>
          <div
            style={{
              height: 8,
              background: '#e0e7ef',
              borderRadius: 4,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #4f8cff 0%, #38e8ff 100%)',
                transition: 'width 0.3s',
              }}
            />
          </div>
          <div style={{ fontSize: 13, color: '#7a7a7a', marginTop: 6, textAlign: 'right' }}>
            Step {stepIndex + 1} of {sessionSteps.length}
          </div>
        </div>

        {/* Card Content */}
        <div style={{ width: '100%' }}>
          {(() => {
            switch (current.type) {
              case 'summary':
                return (
                  <SessionSummary
                    words={current.words}
                    category={current.category}
                    onNext={handleNext}
                  />
                );
              case 'expose':
                return (
                  <ExposeCard
                    word={current.word}
                    onNext={handleNext}
                  />
                );
              case 'cloze':
                return (
                  <ClozeCard
                    sentence={current.sentence}
                    translation={current.translation}
                    options={current.options}
                    answer={current.answer}
                    onNext={handleNext}
                  />
                );
              case 'match':
                return (
                  <MatchCard
                    pairs={current.pairs}
                    onNext={handleNext}
                  />
                );
              case 'summary-end':
                return (
                  <SessionSummaryEnd
                    words={current.reviewWords}
                    onDone={() => navigate('/dashboard')}
                  />
                );
              default:
                return <div>🚧 Unknown step type.</div>;
            }
          })()}
        </div>
      </div>
    </div>
  );
}
