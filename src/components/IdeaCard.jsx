import { useState } from 'react';
import { getScoreColor, getQuadrantStyle, formatDate } from '../lib/utils';

export default function IdeaCard({ idea, onUpdate, onDelete, aiCritique, aiLoading, onGetCritique }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editImpact, setEditImpact] = useState(idea.impact);
  const [editFeasibility, setEditFeasibility] = useState(idea.feasibility);
  const [editEffort, setEditEffort] = useState(idea.effort);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showCritique, setShowCritique] = useState(false);

  const quadStyle = getQuadrantStyle(idea.quadrant);

  const handleSave = async () => {
    try {
      await onUpdate(idea.id, {
        impact: editImpact,
        feasibility: editFeasibility,
        effort: editEffort
      });
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteClick = async () => {
    if (confirm(`Are you sure you want to delete/archive "${idea.title}"?`)) {
      setIsDeleting(true);
      await onDelete(idea.id);
      setIsDeleting(false);
    }
  };

  const getCategoryEmoji = (cat) => {
    switch (cat) {
      case 'Tech': return '💻';
      case 'Business': return '💼';
      case 'Life': return '🌱';
      case 'Design': return '🎨';
      case 'Creative': return '✍️';
      default: return '💡';
    }
  };

  return (
    <div className={`idea-card ${isEditing ? 'editing' : ''}`} style={{ borderColor: getScoreColor(idea.score) + '30' }}>
      <div className="card-header">
        <div className="card-meta">
          <span className="card-category">
            {getCategoryEmoji(idea.category)} {idea.category}
          </span>
          <span className="card-date">{formatDate(idea.created_at)}</span>
        </div>
        
        <div className="card-score-badge" style={{ 
          color: getScoreColor(idea.score), 
          borderColor: getScoreColor(idea.score),
          boxShadow: `0 0 12px ${getScoreColor(idea.score)}22`
        }}>
          {idea.score}
        </div>
      </div>

      <div className="card-body">
        <h4 className="card-title">{idea.title}</h4>
        <p className="card-description">{idea.description}</p>
        
        <div className="quadrant-badge-row">
          <span 
            className="quadrant-tag"
            style={{
              backgroundColor: quadStyle.bg,
              borderColor: quadStyle.border,
              color: quadStyle.text,
              boxShadow: `0 0 8px ${quadStyle.shadow}`
            }}
          >
            🎯 {idea.quadrant}
          </span>
        </div>

        {/* Dynamic score values visual indicators */}
        <div className="card-metrics-grid">
          <div className="metric-row">
            <span className="metric-name">Impact</span>
            <div className="metric-bar-container">
              {isEditing ? (
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={editImpact}
                  onChange={(e) => setEditImpact(parseInt(e.target.value))}
                  className="card-slider-input impact"
                />
              ) : (
                <div className="metric-bar impact-bar" style={{ width: `${idea.impact * 10}%` }}></div>
              )}
            </div>
            <span className="metric-val">{isEditing ? editImpact : idea.impact}/10</span>
          </div>

          <div className="metric-row">
            <span className="metric-name">Feasibility</span>
            <div className="metric-bar-container">
              {isEditing ? (
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={editFeasibility}
                  onChange={(e) => setEditFeasibility(parseInt(e.target.value))}
                  className="card-slider-input feasibility"
                />
              ) : (
                <div className="metric-bar feasibility-bar" style={{ width: `${idea.feasibility * 10}%` }}></div>
              )}
            </div>
            <span className="metric-val">{isEditing ? editFeasibility : idea.feasibility}/10</span>
          </div>

          <div className="metric-row">
            <span className="metric-name">Effort</span>
            <div className="metric-bar-container">
              {isEditing ? (
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={editEffort}
                  onChange={(e) => setEditEffort(parseInt(e.target.value))}
                  className="card-slider-input effort"
                />
              ) : (
                <div className="metric-bar effort-bar" style={{ width: `${idea.effort * 10}%` }}></div>
              )}
            </div>
            <span className="metric-val">{isEditing ? editEffort : idea.effort}/10</span>
          </div>
        </div>
      </div>

      {/* 🤖 AI Co-Pilot Critique slide-down drawer */}
      {showCritique && (
        <div className="card-ai-critique-drawer animate-slide-down">
          <div className="ai-drawer-glow"></div>
          
          {aiLoading ? (
            <div className="ai-loading-state">
              <span className="spinner"></span>
              <p>Consulting Startup Co-Pilot...</p>
            </div>
          ) : aiCritique ? (
            <div className="ai-critique-content">
              <div className="ai-critique-header">
                <h5>🤖 AI Audit</h5>
                <span className={`ai-agree-tag ${aiCritique.auditAgree ? 'agree' : 'disagree'}`}>
                  {aiCritique.auditAgree ? '✅ AI Agrees' : '⚠️ Score Shifted'}
                </span>
              </div>
              
              <p className="ai-critique-text">{aiCritique.auditCritique}</p>
              
              {/* Audit Comparison Metrics Grid */}
              <div className="ai-comparison-grid">
                <div className="comp-header-row">
                  <span>Metric</span>
                  <span>Self</span>
                  <span>AI Rec.</span>
                </div>
                <div className="comp-row">
                  <span className="comp-lbl">Impact</span>
                  <span className="comp-user">{idea.impact}/10</span>
                  <span className="comp-ai" style={{ color: getScoreColor(aiCritique.suggestedScores.impact * 10) }}>
                    {aiCritique.suggestedScores.impact}/10
                  </span>
                </div>
                <div className="comp-row">
                  <span className="comp-lbl">Feasibility</span>
                  <span className="comp-user">{idea.feasibility}/10</span>
                  <span className="comp-ai" style={{ color: getScoreColor(aiCritique.suggestedScores.feasibility * 10) }}>
                    {aiCritique.suggestedScores.feasibility}/10
                  </span>
                </div>
                <div className="comp-row">
                  <span className="comp-lbl">Effort</span>
                  <span className="comp-user">{idea.effort}/10</span>
                  {/* Effort score is color-coded with inverted logic (low effort is good/green) */}
                  <span className="comp-ai" style={{ color: getScoreColor((11 - aiCritique.suggestedScores.effort) * 10) }}>
                    {aiCritique.suggestedScores.effort}/10
                  </span>
                </div>
              </div>

              {/* Actionable items */}
              <div className="ai-improvements-section">
                <h6>💡 Key Scale Actions:</h6>
                <ul className="ai-improvements-list">
                  {aiCritique.improvements.map((imp, idx) => (
                    <li key={idx} className="ai-improvement-item">
                      <span className="bullet-spark">✨</span>
                      <span>{imp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="ai-empty-state">
              <p>Compare self-assessed matrix scores against our GPT-4o-mini strategist.</p>
              <button 
                className="btn-ai-audit"
                onClick={() => onGetCritique(idea.id)}
              >
                ⚡ Fetch AI Audit
              </button>
            </div>
          )}
        </div>
      )}

      <div className="card-actions">
        {isEditing ? (
          <>
            <button className="btn-card-save" onClick={handleSave}>Save</button>
            <button className="btn-card-cancel" onClick={() => {
              setEditImpact(idea.impact);
              setEditFeasibility(idea.feasibility);
              setEditEffort(idea.effort);
              setIsEditing(false);
            }}>Cancel</button>
          </>
        ) : (
          <>
            <button 
              className={`btn-card-ai ${showCritique ? 'active' : ''}`} 
              onClick={() => setShowCritique(!showCritique)}
            >
              🤖 AI Co-Pilot
            </button>
            <button className="btn-card-edit" onClick={() => setIsEditing(true)}>⚡ Quick Adjust</button>
            <button className="btn-card-delete" onClick={handleDeleteClick} disabled={isDeleting}>
              {isDeleting ? 'Archiving...' : '🗑️ Delete'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
