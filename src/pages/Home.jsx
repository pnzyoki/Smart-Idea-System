import ActivityMeter from '../components/ActivityMeter';

export default function Home({ user, ideas, activities, setTab }) {
  const getUsername = (email) => {
    if (!email) return 'Innovator';
    return email.split('@')[0];
  };

  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Good morning';
    if (hr < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Recent ideas preview (top 3)
  const recentIdeas = ideas.slice(0, 3);

  return (
    <div className="page-container home-page animate-fade-in">
      <div className="home-hero">
        <div className="hero-glow"></div>
        <span className="hero-eyebrow">🚀 IDEATION COMMAND CENTER</span>
        <h2>{getGreeting()}, <span className="username-gradient">{getUsername(user?.email)}</span>!</h2>
        <p className="hero-subtitle">
          Transform your raw thoughts into strategic achievements. Score them through our 
          mathematical matrices to isolate your highest value opportunities.
        </p>
        <div className="hero-actions">
          <button className="btn-primary" onClick={() => setTab('ideas')}>
            ⚡ Launch Idea Room
          </button>
          <button className="btn-secondary" onClick={() => setTab('activity')}>
            📊 Check Activity Logs
          </button>
        </div>
      </div>

      <div className="home-layout-grid">
        {/* Left Side: Dynamic Activity Gauge */}
        <div className="home-col">
          <ActivityMeter ideas={ideas} activities={activities} />
        </div>

        {/* Right Side: Quick stats & Recent entries preview */}
        <div className="home-col recent-ideas-col">
          <div className="recent-ideas-card">
            <div className="card-inner-glow"></div>
            <h4>🕒 Recent Brainwaves</h4>
            <p className="card-desc font-sm">Your latest submissions recorded in local time.</p>

            {recentIdeas.length > 0 ? (
              <div className="home-recent-list">
                {recentIdeas.map(idea => (
                  <div key={idea.id} className="home-recent-item" onClick={() => setTab('ideas')}>
                    <div className="item-left">
                      <span className="item-title">{idea.title}</span>
                      <span className="item-cat">{idea.category}</span>
                    </div>
                    <div 
                      className="item-score" 
                      style={{ 
                        color: idea.score > 70 ? '#10b981' : idea.score > 40 ? '#06b6d4' : '#fb923c' 
                      }}
                    >
                      {idea.score}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="home-empty-recent">
                <span className="empty-bulb">💡</span>
                <p>No ideas recorded yet.</p>
                <button className="btn-link" onClick={() => setTab('ideas')}>
                  Create your first idea &rarr;
                </button>
              </div>
            )}
          </div>

          <div className="did-you-know-card">
            <h5>💡 Pro Tip</h5>
            <p>
              <strong>Quick Wins</strong> (high impact, low effort) are the most efficient 
              projects to build momentum. If you are stuck, try adjusting your vision to reduce effort, 
              shifting the quadrant classification to accelerate deployment!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
