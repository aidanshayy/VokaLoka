
import React, { useEffect, useState } from 'react';
import { Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import Home from './pages/Home';
import Decks from './pages/Decks';
import Review from './pages/Review';
import Stats from './pages/Stats';
import Auth from './pages/Auth';
import Grammar from './pages/Grammar';
import './App.css';

/**
 * Higher order component that protects a route.  If the user is not
 * authenticated (no token in localStorage), they are redirected to the
 * /auth page.  Otherwise the wrapped component is rendered.
 */
function RequireAuth({ children }: { children: JSX.Element }) {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/auth" replace />;
  }
  return children;
}

const App: React.FC = () => {
  // Track whether the user is authenticated.  This state is derived from
  // the presence of a token in localStorage.  We expose a handler to
  // update this state when the user logs in or out.
  const [authenticated, setAuthenticated] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    // On initial mount, synchronise the authenticated flag with the
    // contents of localStorage.  Reading directly from localStorage
    // inside the render function would work, but keeping a state here
    // allows us to explicitly update when login/logout occurs.
    const token = localStorage.getItem('token');
    setAuthenticated(Boolean(token));
  }, []);

  /**
   * Callback invoked by the Auth component when a user successfully logs in.
   * Setting the authenticated state here causes the navigation bar to
   * re-render and reveal the authenticated routes.  The actual token is
   * stored in localStorage by the login API helper.
   */
  function handleLoginSuccess() {
    setAuthenticated(true);
  }

  /**
   * Log the user out by clearing the stored token and resetting the
   * authenticated flag.  Afterwards, redirect to the auth page.
   */
  function handleLogout() {
    localStorage.removeItem('token');
    setAuthenticated(false);
    navigate('/auth');
  }

  return (
    <div className="app">
      <nav className="navbar">
        <h1 className="logo">vokaloka</h1>
        <ul className="nav-links">
          <li><Link to="/">Home</Link></li>
          {authenticated && <li><Link to="/decks">Decks</Link></li>}
          {authenticated && <li><Link to="/review">Review</Link></li>}
          {authenticated && <li><Link to="/stats">Stats</Link></li>}
          {authenticated && <li><Link to="/grammar">Grammar</Link></li>}
          
          {/* Always show a login status indicator on the far right */}
          <li className="status">
            {authenticated ? 'Logged in' : 'Not logged in'}
          </li>
          {/* Show login or logout depending on authentication state */}
          {!authenticated ? (
            <li><Link to="/auth">Login</Link></li>
          ) : (
            <li><button className="logout-button" onClick={handleLogout}>Logout</button></li>
          )}
        </ul>
      </nav>
      <main className="content">
        <Routes>
          <Route path="/" element={<Home />} />
          {/* Pass down the login handler to the Auth component */}
          <Route path="/auth" element={<Auth onLogin={handleLoginSuccess} />} />
          <Route
            path="/decks"
            element={
              <RequireAuth>
                <Decks />
              </RequireAuth>
            }
          />
          <Route
            path="/review"
            element={
              <RequireAuth>
                <Review />
              </RequireAuth>
            }
          />
          <Route
            path="/stats"
            element={
              <RequireAuth>
                <Stats />
              </RequireAuth>
            }
          />
          <Route
            path="/grammar"
            element={
              <RequireAuth>
                <Grammar />
              </RequireAuth>
            }
          />
          
        </Routes>
      </main>
    </div>
  );
};

export default App;
