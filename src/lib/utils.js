/**
 * Utility helpers for formatting, colorizing, and mapping ratings in the UI.
 */

/**
 * Formats a ISO date string into a highly readable relative or absolute format.
 * @param {string} dateString 
 * @returns {string} Readable date text
 */
export function formatDate(dateString) {
  if (!dateString) return 'Just now';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  
  if (diffMs < 0) return 'Just now';
  
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

/**
 * Returns dynamic CSS styling tokens for the quadrant priority tags.
 * @param {string} quadrant 
 * @returns {object} { background, border, text, label }
 */
export function getQuadrantStyle(quadrant) {
  switch (quadrant) {
    case 'Quick Win':
      return {
        bg: 'rgba(16, 185, 129, 0.1)',
        border: 'rgba(16, 185, 129, 0.3)',
        text: '#34d399',
        shadow: 'rgba(16, 185, 129, 0.15)'
      };
    case 'Strategic Pivot':
      return {
        bg: 'rgba(249, 115, 22, 0.1)',
        border: 'rgba(249, 115, 22, 0.3)',
        text: '#fb923c',
        shadow: 'rgba(249, 115, 22, 0.15)'
      };
    case 'Safe Bet':
      return {
        bg: 'rgba(6, 182, 212, 0.1)',
        border: 'rgba(6, 182, 212, 0.3)',
        text: '#22d3ee',
        shadow: 'rgba(6, 182, 212, 0.15)'
      };
    case 'Long Shot':
      return {
        bg: 'rgba(236, 72, 153, 0.1)',
        border: 'rgba(236, 72, 153, 0.3)',
        text: '#f472b6',
        shadow: 'rgba(236, 72, 153, 0.15)'
      };
    default:
      return {
        bg: 'rgba(156, 163, 175, 0.1)',
        border: 'rgba(156, 163, 175, 0.2)',
        text: '#d1d5db',
        shadow: 'none'
      };
  }
}

/**
 * Interpolates a temperature-like color based on the dynamic score (0-100).
 * Yields smooth transitions from soft red to golden orange, vibrant yellow, neon emerald, and cyan.
 * @param {number} score - from 0 to 100
 * @returns {string} HSL color string
 */
export function getScoreColor(score) {
  const s = Math.min(100, Math.max(0, score));
  // 0 is red (hue 0), 50 is yellow (hue 55), 100 is pure emerald-cyan (hue 150)
  let hue;
  if (s < 50) {
    // scale from 0 to 55
    hue = (s / 50) * 55;
  } else {
    // scale from 55 to 150
    hue = 55 + ((s - 50) / 50) * 95;
  }
  return `hsl(${hue}, 85%, 60%)`;
}
