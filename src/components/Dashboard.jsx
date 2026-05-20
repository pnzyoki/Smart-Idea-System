import { useMemo, useState } from 'react';
import { getScoreColor } from '../lib/utils';
import { isOpenAIConfigured } from '../lib/aiClient';

export default function Dashboard({ ideas, aiGroups, aiGroupsLoading, runAIGrouping }) {
  // Keeps track of which folder is expanded (for interactive folder view)
  const [expandedFolder, setExpandedFolder] = useState(null);

  const stats = useMemo(() => {
    const total = ideas.length;
    if (total === 0) {
      return {
        total: 0,
        avgScore: 0,
        avgImpact: 0,
        avgFeasibility: 0,
        avgEffort: 0,
        quadrants: { 'Quick Win': 0, 'Strategic Pivot': 0, 'Safe Bet': 0, 'Long Shot': 0, 'Backburner': 0 },
        categories: { Tech: 0, Business: 0, Life: 0, Design: 0, Creative: 0, Other: 0 },
        insight: 'Welcome! Create your very first idea to trigger live dashboard matrices and custom recommendations.'
      };
    }

    let sumScore = 0;
    let sumImpact = 0;
    let sumFeasibility = 0;
    let sumEffort = 0;

    const quadrants = { 'Quick Win': 0, 'Strategic Pivot': 0, 'Safe Bet': 0, 'Long Shot': 0, 'Backburner': 0 };
    const categories = { Tech: 0, Business: 0, Life: 0, Design: 0, Creative: 0, Other: 0 };

    ideas.forEach(idea => {
      sumScore += idea.score;
      sumImpact += idea.impact;
      sumFeasibility += idea.feasibility;
      sumEffort += idea.effort;

      if (quadrants[idea.quadrant] !== undefined) {
        quadrants[idea.quadrant]++;
      } else {
        quadrants['Backburner']++;
      }

      if (categories[idea.category] !== undefined) {
        categories[idea.category]++;
      } else {
        categories['Other']++;
      }
    });

    const avgScore = Math.round(sumScore / total);
    const avgImpact = Math.round((sumImpact / total) * 10) / 10;
    const avgFeasibility = Math.round((sumFeasibility / total) * 10) / 10;
    const avgEffort = Math.round((sumEffort / total) * 10) / 10;

    // AI recommendation generation
    let insight;
    if (quadrants['Quick Win'] > 0 && quadrants['Quick Win'] >= Math.floor(total * 0.4)) {
      insight = '🚀 High Momentum! You are generating excellent Quick Wins. Move these into construction immediately to secure rapid gains!';
    } else if (avgEffort >= 7) {
      insight = '⏳ Resource Heavy! Your ideas tend to demand high effort (average ' + avgEffort + '). Try to run a quick brainstorm specifically focused on low-effort, high-feasibility "Safe Bets" or "Quick Wins" to balance your portfolio.';
    } else if (avgImpact < 5) {
      insight = '⚠️ Low Leverage! The average impact of your ideas is on the lower side. Push your creative limits! Dare to think bigger and brainstorm ideas with impact values of 8 or above.';
    } else if (quadrants['Strategic Pivot'] > quadrants['Quick Win'] && quadrants['Strategic Pivot'] > quadrants['Safe Bet']) {
      insight = '🏔️ Strategic Vision! You have strong, high-impact long-term ideas, but they require high effort. Consider breaking down one "Strategic Pivot" into smaller, digestible micro-milestones to start executing.';
    } else if (quadrants['Safe Bet'] >= Math.floor(total * 0.35)) {
      insight = '🛡️ Highly Practical! You are compiling an abundance of Safe Bets. Excellent for consistency, but make sure to earmark some time to brainstorm a few high-risk, ultra-high-reward "Long Shots" or "Quick Wins".';
    } else {
      insight = '📊 Dynamic Mix! You have a highly balanced innovation portfolio. Continue adding ideas and monitoring their scores to select your next major project.';
    }

    return {
      total,
      avgScore,
      avgImpact,
      avgFeasibility,
      avgEffort,
      quadrants,
      categories,
      insight
    };
  }, [ideas]);

  // Helper to map idea titles in AI groups
  const ideasMap = useMemo(() => {
    const map = {};
    ideas.forEach(idea => {
      map[idea.id] = idea;
    });
    return map;
  }, [ideas]);

  return (
    <div className="dashboard-container">
      {/* 1. Main Stat grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Total Brainwaves</span>
          <span className="stat-value">{stats.total}</span>
          <span className="stat-sub">Active ideas in log</span>
        </div>

        <div className="stat-card score-stat">
          <span className="stat-label">Average Smart Score</span>
          <span className="stat-value" style={{ color: getScoreColor(stats.avgScore) }}>
            {stats.avgScore}
          </span>
          <span className="stat-sub">Out of 100 max</span>
        </div>

        <div className="stat-card parameter-stat">
          <span className="stat-label">Parameters Average</span>
          <div className="param-indicators">
            <div className="param-item">
              <span className="p-val">{stats.avgImpact}/10</span>
              <span className="p-lbl">Impact</span>
            </div>
            <div className="param-item">
              <span className="p-val">{stats.avgFeasibility}/10</span>
              <span className="p-lbl">Feas.</span>
            </div>
            <div className="param-item">
              <span className="p-val">{stats.avgEffort}/10</span>
              <span className="p-lbl">Effort</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Custom Innovation Recommendations banner */}
      <div className="recommendations-banner">
        <div className="recommendations-glow"></div>
        <h5>🧠 Smart Innovation Advisor</h5>
        <p className="recommendation-text">{stats.insight}</p>
      </div>

      {/* ==========================================================
         NEW: OPENAI SEMANTIC FOLDER GROUPING SECTION
         ========================================================== */}
      {stats.total > 0 && (
        <div className="ai-grouping-section">
          <div className="ai-section-header">
            <div>
              <h5>🤖 OpenAI Semantic Clustering</h5>
              <p className="chart-desc">Organize all workspace ideas into context-aware groups using GPT-4o-mini.</p>
            </div>
            {!isOpenAIConfigured && (
              <span className="ai-sandbox-tag">Sandbox Mode active</span>
            )}
          </div>

          {aiGroups.length === 0 ? (
            <div className="ai-grouping-cta">
              <div className="cta-ai-glow"></div>
              <span className="cta-spark">🤖</span>
              <h4>Compile Semantic Clusters</h4>
              <p>
                Analyze all {stats.total} ideas, identify common operational themes, and automatically 
                group them into glowing smart folders using our OpenAI parser.
              </p>
              <button 
                className="btn-ai-primary" 
                onClick={runAIGrouping}
                disabled={aiGroupsLoading}
              >
                {aiGroupsLoading ? (
                  <>
                    <span className="spinner"></span> &nbsp; Aligning Brainwaves...
                  </>
                ) : (
                  '🤖 Run AI Grouping'
                )}
              </button>
            </div>
          ) : (
            <div className="ai-folders-container">
              <div className="ai-folders-header-row">
                <span className="folders-count">Found {aiGroups.length} Strategic Clusters</span>
                <button 
                  className="btn-ai-secondary" 
                  onClick={runAIGrouping}
                  disabled={aiGroupsLoading}
                >
                  {aiGroupsLoading ? <span className="spinner"></span> : '🔄 Re-group Workspace'}
                </button>
              </div>

              <div className="ai-folders-grid">
                {aiGroups.map((folder, fIdx) => {
                  const isExpanded = expandedFolder === fIdx;
                  const validIdeaIds = folder.ideaIds.filter(id => ideasMap[id]);
                  
                  if (validIdeaIds.length === 0) return null;

                  return (
                    <div 
                      key={fIdx} 
                      className={`ai-folder-card ${isExpanded ? 'expanded' : ''}`}
                      onClick={() => setExpandedFolder(isExpanded ? null : fIdx)}
                    >
                      <div className="folder-card-header">
                        <div className="folder-name-row">
                          <span className="folder-icon">📂</span>
                          <span className="folder-title">{folder.folderName}</span>
                        </div>
                        <span className="folder-badge">{validIdeaIds.length} Idea{validIdeaIds.length === 1 ? '' : 's'}</span>
                      </div>
                      
                      <p className="folder-theme">{folder.folderTheme}</p>

                      {isExpanded && (
                        <div className="folder-contents-list animate-fade-in" onClick={(e) => e.stopPropagation()}>
                          {validIdeaIds.map(id => {
                            const idea = ideasMap[id];
                            return (
                              <div key={id} className="folder-item">
                                <div className="folder-item-left">
                                  <span className="f-item-title">{idea.title}</span>
                                  <span className="f-item-cat">{idea.category}</span>
                                </div>
                                <span 
                                  className="f-item-score"
                                  style={{ color: getScoreColor(idea.score) }}
                                >
                                  {idea.score}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                      
                      <div className="folder-footer-hint">
                        {isExpanded ? 'Click to collapse folder' : 'Click to expand contents'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. Custom Charts Section */}
      <div className="charts-layout">
        <div className="chart-card">
          <h5>🎯 Quadrant Distribution</h5>
          <p className="chart-desc">How your brainstorms align against our priority framework.</p>
          
          <div className="custom-bar-chart">
            {Object.entries(stats.quadrants).map(([quad, count]) => {
              const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
              
              let color = '#a1a1aa';
              if (quad === 'Quick Win') color = '#10b981';
              if (quad === 'Strategic Pivot') color = '#f97316';
              if (quad === 'Safe Bet') color = '#06b6d4';
              if (quad === 'Long Shot') color = '#ec4899';

              return (
                <div key={quad} className="chart-row">
                  <div className="chart-row-label">
                    <span>{quad}</span>
                    <span className="count-val">{count}</span>
                  </div>
                  <div className="chart-row-bar-container">
                    <div className="chart-row-bar" style={{ 
                      width: `${Math.max(3, percentage)}%`,
                      backgroundColor: color,
                      boxShadow: `0 0 8px ${color}33`
                    }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="chart-card">
          <h5>💻 Category Breakdown</h5>
          <p className="chart-desc">Which domains are triggering the most thoughts.</p>
          
          <div className="custom-bar-chart">
            {Object.entries(stats.categories).map(([cat, count]) => {
              const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
              const color = '#6366f1'; // branding color Indigo

              return (
                <div key={cat} className="chart-row">
                  <div className="chart-row-label">
                    <span>{cat}</span>
                    <span className="count-val">{count}</span>
                  </div>
                  <div className="chart-row-bar-container">
                    <div className="chart-row-bar" style={{ 
                      width: `${Math.max(3, percentage)}%`,
                      backgroundColor: color,
                      boxShadow: `0 0 8px ${color}33`
                    }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
