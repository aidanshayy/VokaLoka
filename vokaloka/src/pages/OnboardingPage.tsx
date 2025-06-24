import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState({
    goal: '',
    timeframe: '',
    studyTime: '',
    topics: '',
    preferredStyle: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAnswers({
      ...answers,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Onboarding answers:', answers);
    navigate('/dashboard');
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🎓 Let's Personalize Vokaloka for You</h1>
      <p style={styles.subtitle}>
        Answer a few quick questions so we can tailor your language learning journey.
      </p>

      <form onSubmit={handleSubmit} style={styles.form}>
        <label style={styles.label}>
          1️⃣ What's your main language goal?
          <input
            name="goal"
            type="text"
            value={answers.goal}
            onChange={handleChange}
            placeholder="e.g., Speak with locals in Brazil"
            style={styles.input}
            required
          />
        </label>

        <label style={styles.label}>
          2️⃣ When do you want to reach this goal?
          <input
            name="timeframe"
            type="text"
            value={answers.timeframe}
            onChange={handleChange}
            placeholder="e.g., 3 months, 1 year"
            style={styles.input}
            required
          />
        </label>

        <label style={styles.label}>
          3️⃣ How much time per day can you study?
          <input
            name="studyTime"
            type="text"
            value={answers.studyTime}
            onChange={handleChange}
            placeholder="e.g., 15 min, 1 hour"
            style={styles.input}
            required
          />
        </label>

        <label style={styles.label}>
          4️⃣ What topics or situations matter most?
          <input
            name="topics"
            type="text"
            value={answers.topics}
            onChange={handleChange}
            placeholder="e.g., Travel, work, daily conversation"
            style={styles.input}
            required
          />
        </label>

        <label style={styles.label}>
          5️⃣ What's your preferred learning style?
          <input
            name="preferredStyle"
            type="text"
            value={answers.preferredStyle}
            onChange={handleChange}
            placeholder="e.g., Flashcards, videos, quizzes"
            style={styles.input}
            required
          />
        </label>

        <button type="submit" style={styles.button}>
          🚀 Create My Plan
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
