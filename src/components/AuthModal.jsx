import { useState } from 'react';
import { authService, isSupabaseConfigured } from '../lib/supabaseClient';

export default function AuthModal({ onAuthSuccess }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      if (isSignUp) {
        await authService.signUp(email, password);
        setSuccessMessage('Registration successful! Logging you in...');
        setTimeout(() => {
          onAuthSuccess();
        }, 1200);
      } else {
        await authService.signIn(email, password);
        onAuthSuccess();
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-overlay">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-glow"></div>
          
          <div className="auth-header">
            <div className="logo-spark">✨</div>
            <h1>Smart Idea System</h1>
            <p className="auth-subtitle">Capture. Score. Innovate.</p>
          </div>

          <div className="mode-badge">
            {isSupabaseConfigured ? (
              <span className="badge-connected">🔌 Live Supabase Connected</span>
            ) : (
              <span className="badge-sandbox">⚡ Local Sandbox Mode Active</span>
            )}
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {error && <div className="auth-error">{error}</div>}
            {successMessage && <div className="auth-success">{successMessage}</div>}

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <button type="submit" className="btn-auth" disabled={loading}>
              {loading ? (
                <span className="spinner"></span>
              ) : isSignUp ? (
                'Create Account'
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                type="button"
                className="btn-toggle-mode"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError('');
                  setSuccessMessage('');
                }}
                disabled={loading}
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </p>
            {!isSupabaseConfigured && (
              <p className="sandbox-info-footer">
                No credentials needed! Enter any mock email and password (min. 6 chars) to play.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
