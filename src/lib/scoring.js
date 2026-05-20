/**
 * Scoring and classification algorithms for the Smart Idea System.
 */

/**
 * Calculates a unified score between 0 and 100 based on three parameters (each 1-10).
 * 
 * Weights:
 * - Impact: 45% (Higher is better)
 * - Feasibility: 35% (Higher is better)
 * - Effort: 20% (Lower is better, so we invert it: 11 - Effort)
 * 
 * @param {number} impact - Value from 1 to 10
 * @param {number} feasibility - Value from 1 to 10
 * @param {number} effort - Value from 1 to 10
 * @returns {number} Integer score between 0 and 100
 */
export function calculateSmartScore(impact, feasibility, effort) {
  const imp = parseFloat(impact) || 1;
  const feas = parseFloat(feasibility) || 1;
  const eff = parseFloat(effort) || 1;

  // Invert effort so that lower effort yields a higher score contribution
  const invertedEffort = 11 - eff; 

  const weightedImpact = imp * 0.45;
  const weightedFeas = feas * 0.35;
  const weightedEffort = invertedEffort * 0.20;

  const rawScore = (weightedImpact + weightedFeas + weightedEffort) * 10;
  
  // Return rounded score clamped between 0 and 100
  return Math.min(100, Math.max(0, Math.round(rawScore)));
}

/**
 * Classifies an idea into a distinct priority quadrant.
 * 
 * Quadrants:
 * - Quick Win: High Impact (>= 7), Low Effort (<= 4)
 * - Strategic Pivot: High Impact (>= 7), High Effort (>= 7), Moderate Feasibility (>= 5)
 * - Safe Bet: Low/Mod Impact (< 7), High Feasibility (>= 7), Low/Mod Effort (<= 5)
 * - Long Shot: Mod/High Impact (>= 5), Low Feasibility (< 5), High Effort (>= 7)
 * - Backburner: Default quadrant for standard, low-urgency ideas
 * 
 * @param {number} impact 
 * @param {number} feasibility 
 * @param {number} effort 
 * @returns {string} One of: 'Quick Win', 'Strategic Pivot', 'Safe Bet', 'Long Shot', 'Backburner'
 */
export function classifyQuadrant(impact, feasibility, effort) {
  const imp = parseFloat(impact) || 1;
  const feas = parseFloat(feasibility) || 1;
  const eff = parseFloat(effort) || 1;

  if (imp >= 7 && eff <= 4) {
    return 'Quick Win';
  }
  if (imp >= 7 && eff >= 7 && feas >= 5) {
    return 'Strategic Pivot';
  }
  if (imp < 7 && feas >= 7 && eff <= 5) {
    return 'Safe Bet';
  }
  if (imp >= 5 && feas < 5 && eff >= 7) {
    return 'Long Shot';
  }
  
  return 'Backburner';
}
