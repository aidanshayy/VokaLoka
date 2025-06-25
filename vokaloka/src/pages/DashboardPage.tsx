import { useNavigate } from 'react-router-dom';

export default function DashboardPage() {
  const navigate = useNavigate();

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        <header style={styles.header}>
          <h1 style={styles.title}>👋 Welcome back to Vokaloka!</h1>
          <p style={styles.subtitle}>
            Here’s your progress snapshot — keep crushing it!
          </p>
        </header>

        <section style={styles.statsSection}>
          <div style={styles.statCard}>
            <h2 style={styles.statNumber}>A2</h2>
            <p style={styles.statLabel}>Current Level</p>
          </div>
          <div style={styles.statCard}>
            <h2 style={styles.statNumber}>120</h2>
            <p style={styles.statLabel}>Words Learned</p>
          </div>
          <div style={styles.statCard}>
            <h2 style={styles.statNumber}>45 min</h2>
            <p style={styles.statLabel}>Time Studied Today</p>
          </div>
          <div style={styles.statCard}>
            <h2 style={styles.statNumber}>🔥 5 Days</h2>
            <p style={styles.statLabel}>Current Streak</p>
          </div>
        </section>

        {/* 📘 Start Learning Section */}
        <section style={styles.newLearning}>
          <h2>📘 Start Learning</h2>
          <p>Discover 5 new words today — let’s expand your vocabulary!</p>
          <button style={styles.button} onClick={() => navigate('/learn')}>
            Learn New Words
          </button>
        </section>

        {/* 🗂️ Review Section */}
        <section style={styles.nextReview}>
          <h2>🗂️ Next Review Session</h2>
          <p>Stay sharp — consistency fuels fluency!</p>
          <button style={styles.button} onClick={() => navigate('/review')}>
            Start Reviewing
          </button>
        </section>

        {/* 📚 Daily Tip Section */}
        <section style={styles.extraSection}>
          <h2>📚 Daily Tip</h2>
          <p>
            Mastering a few phrases for everyday situations boosts confidence — focus on real-life usage!
          </p>
        </section>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    width: '100%',
    minHeight: '100vh',
    margin: 0,
    padding: 0,
    boxSizing: 'border-box' as const,
    background: 'linear-gradient(135deg, #a8edea, #fed6e3)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  container: {
    fontFamily: 'Helvetica, Arial, sans-serif',
    padding: '60px 20px',
    maxWidth: '1200px',
    width: '100%',
  },
  header: {
    textAlign: 'center' as const,
    marginBottom: '40px',
  },
  title: {
    fontSize: '2.8rem',
    marginBottom: '10px',
    color: '#333',
  },
  subtitle: {
    fontSize: '1.2rem',
    color: '#444',
  },
  statsSection: {
    display: 'flex',
    justifyContent: 'center',
    flexWrap: 'wrap' as const,
    gap: '20px',
    marginBottom: '50px',
  },
  statCard: {
    background: '#ffffff',
    padding: '30px',
    borderRadius: '14px',
    width: '180px',
    textAlign: 'center' as const,
    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)',
    flex: '0 1 auto',
    transition: 'transform 0.2s',
  },
  statNumber: {
    fontSize: '2.2rem',
    margin: '0',
    color: '#ff6b81',
  },
  statLabel: {
    fontSize: '1rem',
    margin: '8px 0 0',
    color: '#555',
  },
  newLearning: {
    background: '#e6f7ff',
    padding: '60px',
    borderRadius: '14px',
    marginBottom: '40px',
    textAlign: 'center' as const,
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
  },
  nextReview: {
    background: '#fff1e6',
    padding: '60px',
    borderRadius: '14px',
    marginBottom: '40px',
    textAlign: 'center' as const,
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
  },
  button: {
    marginTop: '20px',
    fontSize: '1rem',
    padding: '16px 32px',
    borderRadius: '10px',
    border: 'none',
    backgroundColor: '#ff6b81',
    color: '#fff',
    cursor: 'pointer',
    transition: 'background 0.3s, transform 0.2s',
  },
  extraSection: {
    background: '#ffffff',
    padding: '30px',
    borderRadius: '14px',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
    textAlign: 'center' as const,
  },
};
