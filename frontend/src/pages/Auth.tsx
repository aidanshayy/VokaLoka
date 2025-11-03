import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register } from '../services/api';
import './Auth.css';

interface AuthProps {
  /**
   * Callback invoked when the user successfully logs in.  The parent
   * component may use this to update its authenticated state.  If not
   * provided, the component operates normally without notifying the parent.
   */
  onLogin?: () => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(username, password);
      } else {
        await register(username, password);
        // Automatically log in after registration
        await login(username, password);
      }
      // Notify parent of successful login so it can update auth state
      if (onLogin) {
        onLogin();
      }
      // Redirect to decks after login
      navigate('/decks');
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <h2>{mode === 'login' ? 'Login' : 'Create Account'}</h2>
      <form onSubmit={handleSubmit} className="auth-form">
        <label>
          Username
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
        </label>
        <label>
          Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        {error && <p className="error-message">{error}</p>}
        <button type="submit" disabled={loading}>{loading ? 'Please wait…' : (mode === 'login' ? 'Login' : 'Register')}</button>
      </form>
      <p className="toggle-link">
        {mode === 'login' ? (
          <>Don't have an account?{' '}<button onClick={() => setMode('register')}>Register</button></>
        ) : (
          <>Already registered?{' '}<button onClick={() => setMode('login')}>Login</button></>
        )}
      </p>
    </div>
  );
};

export default Auth;