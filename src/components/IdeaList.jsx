import { useState, useMemo } from 'react';
import IdeaCard from './IdeaCard';

export default function IdeaList({ ideas, onUpdateIdea, onDeleteIdea, aiCritiques, aiCritiquesLoading, onGetCritique }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeQuadrant, setActiveQuadrant] = useState('All');
  const [sortBy, setSortBy] = useState('score-desc');

  const categories = ['All', 'Tech', 'Business', 'Life', 'Design', 'Creative', 'Other'];
  const quadrants = ['All', 'Quick Win', 'Strategic Pivot', 'Safe Bet', 'Long Shot', 'Backburner'];

  // Process filters and sorting
  const filteredAndSortedIdeas = useMemo(() => {
    let result = [...ideas];

    // 1. Text Search Filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        idea => 
          idea.title.toLowerCase().includes(term) || 
          idea.description.toLowerCase().includes(term)
      );
    }

    // 2. Category Filter
    if (activeCategory !== 'All') {
      result = result.filter(idea => idea.category === activeCategory);
    }

    // 3. Quadrant Filter
    if (activeQuadrant !== 'All') {
      result = result.filter(idea => idea.quadrant === activeQuadrant);
    }

    // 4. Sort Operations
    result.sort((a, b) => {
      switch (sortBy) {
        case 'score-desc':
          return b.score - a.score;
        case 'score-asc':
          return a.score - b.score;
        case 'newest':
          return new Date(b.created_at) - new Date(a.created_at);
        case 'oldest':
          return new Date(a.created_at) - new Date(b.created_at);
        case 'title-asc':
          return a.title.localeCompare(b.title);
        case 'impact-desc':
          return b.impact - a.impact;
        default:
          return b.score - a.score;
      }
    });

    return result;
  }, [ideas, searchTerm, activeCategory, activeQuadrant, sortBy]);

  return (
    <div className="idea-list-container">
      {/* Search and Sort controls */}
      <div className="filter-controls-card">
        <div className="controls-glow"></div>
        <div className="controls-top-row">
          <div className="search-bar">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search ideas or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button className="clear-search" onClick={() => setSearchTerm('')}>×</button>
            )}
          </div>

          <div className="sort-selector">
            <label htmlFor="sort-dropdown">Sort By</label>
            <select
              id="sort-dropdown"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-dropdown"
            >
              <option value="score-desc">🔥 Highest Score</option>
              <option value="score-asc">❄️ Lowest Score</option>
              <option value="newest">🕒 Newest First</option>
              <option value="oldest">⏳ Oldest First</option>
              <option value="title-asc">🔤 Title (A-Z)</option>
              <option value="impact-desc">💥 Max Impact</option>
            </select>
          </div>
        </div>

        {/* Category filters list */}
        <div className="filter-group">
          <span className="filter-label">Category:</span>
          <div className="pills-scroll-container">
            {categories.map(cat => (
              <button
                key={cat}
                className={`filter-pill ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat === 'All' ? '🌐 All' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Quadrant filters list */}
        <div className="filter-group">
          <span className="filter-label">Priority:</span>
          <div className="pills-scroll-container">
            {quadrants.map(quad => (
              <button
                key={quad}
                className={`filter-pill ${activeQuadrant === quad ? 'active' : ''}`}
                onClick={() => setActiveQuadrant(quad)}
              >
                {quad === 'All' ? '⭐ All' : quad}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid listing */}
      <div className="ideas-results-header">
        <h5>Found {filteredAndSortedIdeas.length} Brainwave{filteredAndSortedIdeas.length === 1 ? '' : 's'}</h5>
      </div>

      {filteredAndSortedIdeas.length > 0 ? (
        <div className="ideas-grid">
          {filteredAndSortedIdeas.map(idea => (
            <IdeaCard
              key={idea.id}
              idea={idea}
              onUpdate={onUpdateIdea}
              onDelete={onDeleteIdea}
              aiCritique={aiCritiques ? aiCritiques[idea.id] : undefined}
              aiLoading={aiCritiquesLoading ? aiCritiquesLoading[idea.id] : false}
              onGetCritique={onGetCritique}
            />
          ))}
        </div>
      ) : (
        <div className="empty-ideas-state">
          <div className="empty-spark">💡</div>
          <h4>No Ideas Match Your Filters</h4>
          <p>Try refining your search terms, categories, or register a new brainwave to start!</p>
          {(searchTerm || activeCategory !== 'All' || activeQuadrant !== 'All') && (
            <button 
              className="btn-clear-filters"
              onClick={() => {
                setSearchTerm('');
                setActiveCategory('All');
                setActiveQuadrant('All');
              }}
            >
              Reset Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
