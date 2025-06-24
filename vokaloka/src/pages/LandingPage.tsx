import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
   <div style={styles.container}>
      {/* Subtle gradient background */}
      <div style={styles.gradient}></div>


      {/* Main hero content */}
      <div style={styles.hero}>
        <h1 style={styles.title}>Welcome to VokaLoka</h1>
        <p style={styles.subtitle}>
          Personalized, AI-powered language learning. Smarter flashcards. Adaptive practice. Master a language on your terms.
        </p>
        <Link to="/onboarding">
          <button style={styles.button}>Start Here</button>
        </Link>
      </div>
    </div>
  );
}

const styles = {
  container: {
    position: 'relative' as const,
    width: '100vw',
    height: '100vh',
    background:
      'linear-gradient(135deg,rgb(186, 200, 221) 0%, #2a5298 50%, #1e3c72 100%)',
    overflow: 'hidden',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontFamily: 'Inter, Helvetica, Arial, sans-serif',
    color: '#fff',
  },
  gradient: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background:
      'radial-gradient(circle at center, rgba(255,255,255,0.4) 0%, transparent 70%)',
    opacity: 0.15,
    zIndex: 0,
  },
  hero: {
    zIndex: 2,
    textAlign: 'center' as const,
    color: '#fff',
    maxWidth: '800px',
    padding: '0 20px',
  },
  title: {
    fontSize: 'rem',
    marginBottom: '20px',
    fontWeight: 800,
    letterSpacing: '1px',
  },
  subtitle: {
    fontSize: '1.4rem',
    marginBottom: '50px',
    lineHeight: '1.6',
    color: '#f9f9f9',
  },
  button: {
    fontSize: '1.2rem',
    padding: '16px 32px',
    borderRadius: '50px',
    border: 'none',
    backgroundColor: '#ffc107',
    color: '#1e3c72',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'transform 0.3s ease',
  },
  
  
};
