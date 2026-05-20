import { useState } from 'react';
import { calculateSmartScore, classifyQuadrant } from '../lib/scoring';
import { getScoreColor, getQuadrantStyle } from '../lib/utils';

export default function IdeaInput({ onAddIdea }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Tech');
  const [impact, setImpact] = useState(5);
  const [feasibility, setFeasibility] = useState(5);
  const [effort, setEffort] = useState(5);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Re-calculate scores live as inputs change on-the-fly (derived state)
  const liveScore = calculateSmartScore(impact, feasibility, effort);
  const liveQuadrant = classifyQuadrant(impact, feasibility, effort);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError('Please provide a title and description.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      await onAddIdea({
        title,
        description,
        category,
        impact,
        feasibility,
        effort
      });
      
      // Reset form
      setTitle('');
      setDescription('');
      setCategory('Tech');
      setImpact(5);
      setFeasibility(5);
      setEffort(5);
      setSuccess(true);
      
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      setError('Failed to capture idea. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const quadStyle = getQuadrantStyle(liveQuadrant);

  return (
    <div className="idea-input-card">
      <div className="input-card-glow"></div>
      <h3>✨ Launch New Brainwave</h3>
      <p className="card-desc">Quantify your thoughts instantly using our smart parameters.</p>
      
      <form onSubmit={handleSubmit} className="idea-form">
        {error && <div className="form-error">{error}</div>}
        {success && <div className="form-success">🎉 Idea captured successfully!</div>}

        <div className="form-group">
          <label htmlFor="title">Idea Title</label>
          <input
            id="title"
            type="text"
            placeholder="e.g., AI-Powered Recipe Builder"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={60}
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Detailed Vision</label>
          <textarea
            id="description"
            rows="3"
            placeholder="What makes this idea unique? How does it work?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={300}
            required
            disabled={loading}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={loading}
            >
              <option value="Tech">💻 Technology</option>
              <option value="Business">💼 Business & Finance</option>
              <option value="Life">🌱 Personal Life</option>
              <option value="Design">🎨 Arts & Design</option>
              <option value="Creative">✍️ Creative & Writing</option>
              <option value="Other">💡 Miscellaneous</option>
            </select>
          </div>
        </div>

        <div className="sliders-section">
          <h4>Smart Parameters</h4>
          
          <div className="slider-group">
            <div className="slider-labels">
              <label htmlFor="impact">Impact</label>
              <span className="slider-value value-impact">{impact}/10</span>
            </div>
            <input
              id="impact"
              type="range"
              min="1"
              max="10"
              value={impact}
              onChange={(e) => setImpact(parseInt(e.target.value))}
              disabled={loading}
              className="range-input impact-range"
            />
            <span className="slider-hint">How transformational is the outcome?</span>
          </div>

          <div className="slider-group">
            <div className="slider-labels">
              <label htmlFor="feasibility">Feasibility</label>
              <span className="slider-value value-feasibility">{feasibility}/10</span>
            </div>
            <input
              id="feasibility"
              type="range"
              min="1"
              max="10"
              value={feasibility}
              onChange={(e) => setFeasibility(parseInt(e.target.value))}
              disabled={loading}
              className="range-input feasibility-range"
            />
            <span className="slider-hint">How practical is it to develop?</span>
          </div>

          <div className="slider-group">
            <div className="slider-labels">
              <label htmlFor="effort">Effort</label>
              <span className="slider-value value-effort">{effort}/10</span>
            </div>
            <input
              id="effort"
              type="range"
              min="1"
              max="10"
              value={effort}
              onChange={(e) => setEffort(parseInt(e.target.value))}
              disabled={loading}
              className="range-input effort-range"
            />
            <span className="slider-hint">How much time & power will it take? (Lower is better)</span>
          </div>
        </div>

        <div className="live-preview-box">
          <div className="live-metric">
            <span className="metric-title">Live Smart Score</span>
            <div 
              className="live-score-circle" 
              style={{ 
                borderColor: getScoreColor(liveScore),
                boxShadow: `0 0 15px ${getScoreColor(liveScore)}33`
              }}
            >
              <span className="score-num" style={{ color: getScoreColor(liveScore) }}>
                {liveScore}
              </span>
            </div>
          </div>
          
          <div className="live-classification">
            <span className="metric-title">Quadrant Classification</span>
            <span 
              className="quadrant-badge"
              style={{
                backgroundColor: quadStyle.bg,
                borderColor: quadStyle.border,
                color: quadStyle.text,
                boxShadow: `0 0 10px ${quadStyle.shadow}`
              }}
            >
              {liveQuadrant}
            </span>
          </div>
        </div>

        <button type="submit" className="btn-submit" disabled={loading}>
          {loading ? 'Recording...' : 'Add Idea to Workspace'}
        </button>
      </form>
    </div>
  );
}
