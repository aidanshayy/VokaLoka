
import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home: React.FC = () => {
  return (
    <div className="home">
      <section className="hero">
        <h2>Welcome to vokaloka</h2>
        <p>Your personalized spaced repetition flashcard app.</p>
        <Link to="/decks" className="cta-button">Start Learning</Link>
      </section>
      <section className="features">
        <div className="feature">
          <h3>Personalized Decks</h3>
          <p>Get custom flashcards based on your progress and interests.</p>
        </div>
        <div className="feature">
          <h3>Spaced Repetition</h3>
          <p>Optimize your memory retention with proven SRS algorithms.</p>
        </div>
        <div className="feature">
          <h3>User-Friendly Interface</h3>
          <p>Enjoy a clean, intuitive interface that lets you focus on learning.</p>
        </div>
      </section>
    </div>
  );
};

export default Home;
