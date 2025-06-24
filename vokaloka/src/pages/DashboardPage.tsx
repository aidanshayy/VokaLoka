export default function DashboardPage() {
  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>👋 Welcome back to Vokaloka!</h1>
        <p style={styles.subtitle}>
          Here’s your progress and what’s next on your language journey.
        </p>
      </header>

      <section style={styles.statsSection}>
        <div style={styles.statCard}>
          <h2 style={styles.statNumber}>120</h2>
          <p style={styles.statLabel}>Words Learned</p>
        </div>
        <div style={styles.statCard}>
          <h2 style={styles.statNumber}>5 Days</h2>
          <p style={styles.statLabel}>Current Streak</p>
        </div>
        <div style={styles.statCard}>
          <h2 style={styles.statNumber}>12</h2>
          <p style={styles.statLabel}>Cards Due Today</p>
        </div>
      </section>

      <section style={styles.nextReview}>
        <h2>🗂️ Next Review</h2>
        <p>Start your review session to keep your memory fresh!</p>
        <button style={styles.button}>Start Reviewing</button>
      </section>

      <section style={styles.extraSection}>
        <h2>📚 Quick Tip</h2>
        <p>
          Did you know? Reviewing small chunks every day is better than cramming!
        </p>
      </section>
    </div>
  );
}

const styles = {
  container: {
    fontFamily: 'Helvetica, Arial, sans-serif',
    padding: '40px 20px',
    maxWidth: '900px',
    margin: '0 auto',
  },
  header: {
    textAlign: 'center' as const,
    marginBottom: '40px',
  },
  title: {
    fontSize: '2.5rem',
    marginBottom: '10px',
    color: '#333',
  },
  subtitle: {
    fontSize: '1.1rem',
    color: '#555',
  },
  statsSection: {
    display: 'flex',
    justifyContent: 'space-around',
    marginBottom: '40px',
    flexWrap: 'wrap' as const,
    gap: '20px',
  },
  statCard: {
    background: '#f0f4ff',
    padding: '20px',
    borderRadius: '10px',
    width: '150px',
    textAlign: 'center' as const,
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  },
  statNumber: {
    fontSize: '2rem',
    margin: '0',
    color: '#0070f3',
  },
  statLabel: {
    fontSize: '1rem',
    margin: '5px 0 0',
    color: '#555',
  },
  nextReview: {
    textAlign: 'center' as const,
    marginBottom: '40px',
    background: '#e6f0ff',
    padding: '30px',
    borderRadius: '10px',
  },
  button: {
    marginTop: '20px',
    fontSize: '1rem',
    padding: '12px 24px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#0070f3',
    color: '#fff',
    cursor: 'pointer',
    transition: 'background 0.3s',
  },
  extraSection: {
    background: '#f9fbff',
    padding: '20px',
    borderRadius: '10px',
    textAlign: 'center' as const,
  },
};
