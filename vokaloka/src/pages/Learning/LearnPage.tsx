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
    word: 'Maçã 🍎',
    translation: 'Apple',
    image: '/images/apple.png',
    note: 'Feminine noun (a maçã)',
    example: 'Eu gosto de comer uma maçã de manhã.',
    translationExample: 'I like to eat apples in the morning.',
  },
  {
    type: 'expose',
    word: 'Pão 🍞',
    translation: 'Bread',
    image: '/images/bread.png',
    note: 'Masculine noun (o pão)',
    example: 'Ela comprou pão fresco na padaria.',
    translationExample: 'She bought fresh bread at the bakery.',
  },
  {
    type: 'expose',
    word: 'Carro 🚗',
    translation: 'Car',
    image: '/images/car.png',
    note: 'Masculine noun (o carro)',
    example: 'O carro está estacionado na rua.',
    translationExample: 'The car is parked on the street.',
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

  switch (current.type) {
    case 'summary':
      return <SessionSummary words={current.words} category={current.category} onNext={handleNext} />;
    case 'expose':
      return (
        <ExposeCard
          word={current.word}
          translation={current.translation}
          image={current.image}
          note={current.note}
          example={current.example}
          translationExample={current.translationExample}
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
      return <MatchCard pairs={current.pairs} onNext={handleNext} />;
    case 'summary-end':
      return <SessionSummaryEnd words={current.reviewWords} onDone={() => navigate('/dashboard')} />;
    default:
      return <div>🚧 Unknown step type.</div>;
  }
}
