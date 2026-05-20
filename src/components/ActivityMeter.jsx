import { useMemo } from 'react';

export default function ActivityMeter({ ideas, activities }) {
  
  const momentumStats = useMemo(() => {
    // 1. Calculate how many ideas in the last 7 days
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const recentIdeas = ideas.filter(idea => {
      const created = new Date(idea.created_at || new Date());
      return created >= sevenDaysAgo;
    });

    const recentCount = recentIdeas.length;
    
    // 2. Determine velocity level
    let percentage;
    let label;
    let color;
    let emoji;
    let glow;

    if (recentCount === 0) {
      percentage = 10;
      label = 'Chilled';
      color = '#06b6d4'; // Cyan
      emoji = '🧊';
      glow = 'rgba(6, 182, 212, 0.15)';
    } else if (recentCount <= 2) {
      percentage = 35;
      label = 'Sparking';
      color = '#10b981'; // Emerald
      emoji = '✨';
      glow = 'rgba(16, 185, 129, 0.2)';
    } else if (recentCount <= 4) {
      percentage = 65;
      label = 'Blazing';
      color = '#f97316'; // Orange
      emoji = '🔥';
      glow = 'rgba(249, 115, 22, 0.25)';
    } else {
      percentage = 95;
      label = 'Supernova';
      color = '#ec4899'; // Ruby Pink
      emoji = '⚡';
      glow = 'rgba(236, 72, 153, 0.3)';
    }

    // 3. Calculate consecutive streaks
    // Sort all unique dates of activities/ideas created
    const dates = [
      ...ideas.map(i => i.created_at ? i.created_at.split('T')[0] : ''),
      ...activities.map(a => a.timestamp ? a.timestamp.split('T')[0] : '')
    ]
      .filter(d => d)
      .map(d => new Date(d).toDateString());
    
    const uniqueDates = Array.from(new Set(dates)).map(d => new Date(d));
    
    // Sort descending
    uniqueDates.sort((a, b) => b - a);

    let streak = 0;
    if (uniqueDates.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      yesterday.setHours(0, 0, 0, 0);

      const latestActivityDate = new Date(uniqueDates[0]);
      latestActivityDate.setHours(0, 0, 0, 0);

      // Check if latest activity is today or yesterday to keep streak alive
      if (latestActivityDate.getTime() === today.getTime() || latestActivityDate.getTime() === yesterday.getTime()) {
        streak = 1;
        let expectedTime = latestActivityDate.getTime();
        
        for (let i = 1; i < uniqueDates.length; i++) {
          expectedTime -= 24 * 60 * 60 * 1000;
          const nextDate = new Date(uniqueDates[i]);
          nextDate.setHours(0, 0, 0, 0);
          
          if (nextDate.getTime() === expectedTime) {
            streak++;
          } else {
            break;
          }
        }
      }
    }

    return {
      recentCount,
      percentage,
      label,
      color,
      emoji,
      glow,
      streak
    };
  }, [ideas, activities]);

  // SVG Gauge calculations
  const radius = 50;
  const stroke = 8;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (momentumStats.percentage / 100) * circumference;

  return (
    <div className="activity-meter-card">
      <div className="meter-card-glow" style={{ backgroundColor: momentumStats.color + '1a' }}></div>
      <h4>🧠 Innovation Velocity</h4>
      <p className="card-desc">Your mental momentum score based on ideas registered this week.</p>
      
      <div className="meter-gauge-container">
        <svg height={radius * 2} width={radius * 2} className="gauge-svg">
          {/* Background circle */}
          <circle
            stroke="rgba(255,255,255,0.05)"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          {/* Progress circle */}
          <circle
            stroke={momentumStats.color}
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={circumference + ' ' + circumference}
            style={{ strokeDashoffset }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            className="gauge-circle-progress"
          />
        </svg>

        <div className="gauge-inner-content">
          <span className="gauge-emoji">{momentumStats.emoji}</span>
          <span className="gauge-label" style={{ color: momentumStats.color }}>{momentumStats.label}</span>
          <span className="gauge-sub">{momentumStats.recentCount} this week</span>
        </div>
      </div>

      <div className="streak-container" style={{ 
        borderColor: momentumStats.streak > 0 ? momentumStats.color + '40' : 'rgba(255,255,255,0.05)',
        boxShadow: momentumStats.streak > 0 ? `0 0 15px ${momentumStats.color}15` : 'none'
      }}>
        <div className="streak-icon">🔥</div>
        <div className="streak-details">
          <span className="streak-num">{momentumStats.streak} Day{momentumStats.streak === 1 ? '' : 's'}</span>
          <span className="streak-label">Consecutive Streak</span>
        </div>
      </div>
      
      <div className="momentum-breakdown">
        <div className="progress-mini-bar-container">
          <div className="progress-mini-bar" style={{ 
            width: `${momentumStats.percentage}%`, 
            backgroundColor: momentumStats.color,
            boxShadow: `0 0 10px ${momentumStats.color}50` 
          }}></div>
        </div>
        <div className="progress-labels">
          <span>Chilled</span>
          <span>Sparking</span>
          <span>Blazing</span>
        </div>
      </div>
    </div>
  );
}
