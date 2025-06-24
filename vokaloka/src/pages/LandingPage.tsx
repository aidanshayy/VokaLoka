import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function LandingPage() {
  // Floating bubble animation config
  const floatTransition = {
    y: {
      duration: 10,
      yoyo: Infinity,
      ease: 'easeInOut',
    },
    x: {
      duration: 12,
      yoyo: Infinity,
      ease: 'easeInOut',
    },
  };

  return (
    <div style={styles.container}>
      {/* Subtle gradient background */}
      <div style={styles.gradient}></div>

      {/* Floating decorative bubbles */}
      <motion.div
        style={{ ...styles.bubble, top: '10%', left: '5%' }}
        animate={{ y: [0, 40, 0], x: [0, 30, 0] }}
        transition={floatTransition}
      >
        💭
      </motion.div>

      <motion.div
        style={{ ...styles.bubble, top: '20%', right: '5%' }}
        animate={{ y: [0, -40, 0], x: [0, -30, 0] }}
        transition={floatTransition}
      >
        🗨️
      </motion.div>

      <motion.div
        style={{ ...styles.bubble, bottom: '15%', left: '8%' }}
        animate={{ y: [0, -30, 0], x: [0, 40, 0] }}
        transition={floatTransition}
      >
        💡
      </motion.div>

      <motion.div
        style={{ ...styles.bubble, bottom: '12%', right: '8%' }}
        animate={{ y: [0, 30, 0], x: [0, -40, 0] }}
        transition={floatTransition}
      >
        ✏️
      </motion.div>

      {/* Main hero content */}
      <div style={styles.hero}>
        <h1 style={styles.title}>Vokaloka</h1>
        <p style={styles.subtitle}>
          Personalized, AI-powered language learning. Smarter flashcards. Adaptive practice. Master a language on your terms.
        </p>
        <Link to="/onboarding">
          <button style={styles.button}>Get Started Free</button>
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
    background: '#e63946',
    overflow: 'hidden',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontFamily: 'Helvetica, Arial, sans-serif',
  },
  gradient: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'radial-gradient(circle at center, #f1f1f1 0%, transparent 70%)',
    opacity: 0.1,
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
    fontSize: '4rem',
    marginBottom: '20px',
    fontWeight: 700,
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
    backgroundColor: '#fff',
    color: '#e63946',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'transform 0.3s ease',
  },
  bubble: {
    position: 'absolute' as const,
    backgroundColor: '#fff',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.2rem',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
    zIndex: 1,
    pointerEvents: 'none',
  },
};

