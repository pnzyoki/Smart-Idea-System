import Dashboard from '../components/Dashboard';
import { formatDate } from '../lib/utils';

export default function Activity({ ideas, activities, onClearLogs, aiGroups, aiGroupsLoading, runAIGrouping }) {
  
  const getActivityEmoji = (type) => {
    switch (type) {
      case 'create': return '✨';
      case 'update': return '⚡';
      case 'delete': return '🗑️';
      case 'system': return '🛡️';
      default: return '📝';
    }
  };

  const handleClearActivities = () => {
    if (confirm('Are you sure you want to flush all activity logs? This will reset your streaks but won\'t delete your ideas.')) {
      localStorage.setItem('smart_ideas_activities', '[]');
      if (onClearLogs) onClearLogs();
    }
  };

  return (
    <div className="page-container activity-page animate-fade-in">
      <div className="activity-page-header">
        <div>
          <h2>📊 Analytics & Activity</h2>
          <p className="subtitle">Detailed breakdown of your innovation stats and action timeline.</p>
        </div>
      </div>

      {/* Stats Dashboard section with OpenAI parameters */}
      <Dashboard 
        ideas={ideas} 
        aiGroups={aiGroups}
        aiGroupsLoading={aiGroupsLoading}
        runAIGrouping={runAIGrouping}
      />

      {/* Timeline logs section */}
      <div className="timeline-card">
        <div className="timeline-glow"></div>
        <div className="timeline-header-row">
          <h4>⏳ Activity Timeline</h4>
          {activities.length > 0 && (
            <button className="btn-clear-logs" onClick={handleClearActivities}>
              Clear Timeline
            </button>
          )}
        </div>
        
        <p className="card-desc font-sm">A real-time log of your innovation exercises.</p>

        {activities.length > 0 ? (
          <div className="activity-timeline-feed">
            {activities.map((act) => (
              <div key={act.id} className={`timeline-item type-${act.type}`}>
                <div className="timeline-badge">
                  {getActivityEmoji(act.type)}
                </div>
                <div className="timeline-content">
                  <div className="timeline-text">{act.text}</div>
                  <div className="timeline-time">{formatDate(act.timestamp)}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-timeline-state">
            <span className="timeline-bulb">⏳</span>
            <h4>Timeline Is Quiet</h4>
            <p>Go to the Idea Room, adjust parameter sliders, or register an idea to build history!</p>
          </div>
        )}
      </div>
    </div>
  );
}
