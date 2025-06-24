export default function DashboardPage() {
  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        <header style={styles.header}>
          <h1 style={styles.title}>👋 Welcome back to Vokaloka!</h1>
          <p style={styles.subtitle}>
            Here’s a snapshot of your journey — keep up the great work!
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
          <div style={styles.statCard}>
            <h2 style={styles.statNumber}>Level 3</h2>
            <p style={styles.statLabel}>Current Level</p>
          </div>
          <div style={styles.statCard}>
            <h2 style={styles.statNumber}>15 hrs</h2>
            <p style={styles.statLabel}>Total Time Studied</p>
          </div>
          <div style={styles.statCard}>
            <h2 style={styles.statNumber}>7 Days</h2>
            <p style={styles.statLabel}>Next Milestone</p>
          </div>
        </section>

        <section style={styles.nextReview}>
          <h2>🗂️ Next Review Session</h2>
          <p>Keep your memory fresh — consistency is key!</p>
          <button style={styles.button}>Start Reviewing</button>
        </section>

        <section style={styles.extraSection}>
          <h2>📚 Daily Tip</h2>
          <p>
            Learning 5–10 new words per day is more effective than cramming 50 at once. Small steps build big fluency!
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
    background: 'linear-gradient(135deg, #e6f0ff, #f9fbff)',
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
    color: '#555',
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
    padding: '25px',
    borderRadius: '12px',
    width: '160px',
    textAlign: 'center' as const,
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
    flex: '0 1 auto',
  },
  statNumber: {
    fontSize: '2rem',
    margin: '0',
    color: '#0070f3',
  },
  statLabel: {
    fontSize: '1rem',
    margin: '8px 0 0',
    color: '#555',
  },
  nextReview: {
    background: '#d0e8ff',
    padding: '40px',
    borderRadius: '12px',
    marginBottom: '40px',
    textAlign: 'center' as const,
  },
  button: {
    marginTop: '20px',
    fontSize: '1rem',
    padding: '14px 28px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#0070f3',
    color: '#fff',
    cursor: 'pointer',
    transition: 'background 0.3s',
  },
  extraSection: {
    background: '#ffffff',
    padding: '30px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
    textAlign: 'center' as const,
  },
};


