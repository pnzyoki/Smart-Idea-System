import { useState, useEffect } from 'react';
import { authService } from './lib/supabaseClient';
import { useIdeas } from './hooks/useIdeas';
import AuthModal from './components/AuthModal';
import Home from './pages/Home';
import Ideas from './pages/Ideas';
import Activity from './pages/Activity';

export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [tab, setTab] = useState('home'); // 'home' | 'ideas' | 'activity'

  // Listen to Auth State Changes
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        setUser(null);
      }
      setAuthLoading(false);
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // Hook handles all data CRUD operations
  const {
    ideas,
    activities,
    loading: dbLoading,
    addIdea,
    updateIdea,
    deleteIdea,
    refreshIdeas,
    aiGroups,
    aiGroupsLoading,
    runAIGrouping,
    aiCritiques,
    aiCritiquesLoading,
    getCardCritique
  } = useIdeas(user);

  const handleSignOut = async () => {
    try {
      await authService.signOut();
      setUser(null);
      setTab('home');
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  // If initial auth is fetching, render a gorgeous premium loading splash
  if (authLoading) {
    return (
      <div className="auth-overlay">
        <div className="gauge-inner-content animate-pulse">
          <div className="logo-spark">✨</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800 }}>Initializing Workspace...</h2>
          <div className="spinner" style={{ marginTop: '1.5rem' }}></div>
        </div>
      </div>
    );
  }

  // If no user is authenticated, redirect to AuthModal
  if (!user) {
    return <AuthModal onAuthSuccess={refreshIdeas} />;
  }

  return (
    <div className="app-container">
      {/* 1. TOP HEADER NAVIGATION (Desktop-first) */}
      <header className="app-header">
        <div className="brand" onClick={() => setTab('home')}>
          <span className="brand-icon">✨</span>
          <h2>Smart Idea System</h2>
        </div>

        <nav className="desktop-nav">
          <button 
            className={`nav-link ${tab === 'home' ? 'active' : ''}`}
            onClick={() => setTab('home')}
          >
            🏠 Home
          </button>
          <button 
            className={`nav-link ${tab === 'ideas' ? 'active' : ''}`}
            onClick={() => setTab('ideas')}
          >
            💡 Idea Room
          </button>
          <button 
            className={`nav-link ${tab === 'activity' ? 'active' : ''}`}
            onClick={() => setTab('activity')}
          >
            📊 Analytics
          </button>
        </nav>

        <div className="user-controls">
          <span className="user-email-chip" title={user.email}>
            👤 {user.email}
          </span>
          <button className="btn-signout" onClick={handleSignOut}>
            Sign Out
          </button>
        </div>
      </header>

      {/* 2. DYNAMIC MAIN CONTAINER */}
      <main className="main-content">
        {dbLoading && ideas.length === 0 ? (
          <div className="page-container" style={{ textAlign: 'center', paddingTop: '5rem' }}>
            <div className="spinner" style={{ margin: '0 auto' }}></div>
            <p style={{ color: 'var(--text-secondary)', marginTop: '1rem' }}>Synchronizing Brainwaves...</p>
          </div>
        ) : (
          <>
            {tab === 'home' && (
              <Home 
                user={user} 
                ideas={ideas} 
                activities={activities} 
                setTab={setTab} 
              />
            )}
            
            {tab === 'ideas' && (
              <Ideas 
                ideas={ideas} 
                onAddIdea={addIdea} 
                onUpdateIdea={updateIdea} 
                onDeleteIdea={deleteIdea} 
                aiCritiques={aiCritiques}
                aiCritiquesLoading={aiCritiquesLoading}
                onGetCritique={getCardCritique}
              />
            )}
            
            {tab === 'activity' && (
              <Activity 
                ideas={ideas} 
                activities={activities} 
                onClearLogs={refreshIdeas}
                aiGroups={aiGroups}
                aiGroupsLoading={aiGroupsLoading}
                runAIGrouping={runAIGrouping}
              />
            )}
          </>
        )}
      </main>

      {/* 3. PERSISTENT MOBILE BOTTOM NAVIGATION */}
      <nav className="mobile-nav">
        <button 
          className={`mobile-nav-link ${tab === 'home' ? 'active' : ''}`}
          onClick={() => setTab('home')}
        >
          <span>🏠</span>
          <span>Home</span>
        </button>
        <button 
          className={`mobile-nav-link ${tab === 'ideas' ? 'active' : ''}`}
          onClick={() => setTab('ideas')}
        >
          <span>💡</span>
          <span>Idea Room</span>
        </button>
        <button 
          className={`mobile-nav-link ${tab === 'activity' ? 'active' : ''}`}
          onClick={() => setTab('activity')}
        >
          <span>📊</span>
          <span>Analytics</span>
        </button>
        <button 
          className="mobile-nav-link" 
          onClick={handleSignOut}
          style={{ color: 'var(--ruby-pink)' }}
        >
          <span>🚪</span>
          <span>Sign Out</span>
        </button>
      </nav>
    </div>
  );
}
