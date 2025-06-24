import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [goal, setGoal] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('User goal:', goal);
    navigate('/dashboard');
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🎓 Let's Personalize Vokaloka for You</h1>
      <p style={styles.subtitle}>
        Tell us your goals so Vokaloka can build a custom flashcard deck and grammar plan just for you.
      </p>

      <form onSubmit={handleSubmit} style={styles.form}>
        <label style={styles.label}>
          Your main goal:
          <input
            type="text"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="e.g., Talk to locals in Brazil, pass an exam..."
            style={styles.input}
            required
          />
        </label>

        <button type="submit" style={styles.button}>
          Continue
        </button>
      </form>
    </div>
  );
}

const styles = {
  container: {
    textAlign: 'center' as const,
    padding: '80px 20px',
    fontFamily: 'Helvetica, Arial, sans-serif',
    background: 'linear-gradient(135deg, #e6f0ff, #f9fbff)',
    minHeight: '100vh',
  },
  title: {
    fontSize: '2.5rem',
    marginBottom: '20px',
    color: '#333',
  },
  subtitle: {
    fontSize: '1rem',
    color: '#555',
    maxWidth: '600px',
    margin: '0 auto 40px',
    lineHeight: '1.6',
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
  },
  label: {
    fontSize: '1rem',
    marginBottom: '20px',
    width: '100%',
    maxWidth: '400px',
    textAlign: 'left' as const,
  },
  input: {
    width: '100%',
    padding: '12px',
    fontSize: '1rem',
    marginTop: '8px',
    borderRadius: '6px',
    border: '1px solid #aaa',
  },
  button: {
    fontSize: '1rem',
    padding: '14px 28px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#0070f3',
    color: '#fff',
    cursor: 'pointer',
    transition: 'background 0.3s',
  },
};
