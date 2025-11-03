
import React, { useEffect, useState } from 'react';
import { fetchDecks } from '../services/api';
import { Link } from 'react-router-dom';
import './Decks.css';

interface Deck {
  id: string;
  name: string;
  description: string;
}

const Decks: React.FC = () => {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadDecks = async () => {
      try {
        const data = await fetchDecks();
        setDecks(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadDecks();
  }, []);

  return (
    <div className="decks">
      <h2>Your Decks</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul className="deck-list">
          {decks.map(deck => (
            <li key={deck.id} className="deck-item">
              <Link to={`/review?deckId=${deck.id}`} className="deck-link">
                <h4>{deck.name}</h4>
                <p>{deck.description}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Decks;
