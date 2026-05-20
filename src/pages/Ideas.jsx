import { useState } from 'react';
import IdeaInput from '../components/IdeaInput';
import IdeaList from '../components/IdeaList';

export default function Ideas({ ideas, onAddIdea, onUpdateIdea, onDeleteIdea, aiCritiques, aiCritiquesLoading, onGetCritique }) {
  // Mobile-specific sub-tab selector
  // 'capture' displays the IdeaInput form
  // 'list' displays the IdeaList grid
  const [mobileSubTab, setMobileSubTab] = useState('list');

  return (
    <div className="page-container ideas-page animate-fade-in">
      <div className="ideas-page-header">
        <div>
          <h2>💡 Idea Room</h2>
          <p className="subtitle">Brainstorm, rate, and manage your innovative thoughts.</p>
        </div>

        {/* Mobile workspace sub-navigation bar */}
        <div className="mobile-sub-tabs">
          <button
            className={`sub-tab-btn ${mobileSubTab === 'list' ? 'active' : ''}`}
            onClick={() => setMobileSubTab('list')}
          >
            📋 Workspace ({ideas.length})
          </button>
          <button
            className={`sub-tab-btn ${mobileSubTab === 'capture' ? 'active' : ''}`}
            onClick={() => setMobileSubTab('capture')}
          >
            ✨ Capture Form
          </button>
        </div>
      </div>

      <div className="ideas-workspace-layout">
        {/* Left column: Idea Input (hidden on mobile when list tab is active) */}
        <div className={`workspace-col-input ${mobileSubTab === 'capture' ? 'mobile-visible' : 'mobile-hidden'}`}>
          <IdeaInput onAddIdea={onAddIdea} />
        </div>

        {/* Right column: Idea List (hidden on mobile when capture tab is active) */}
        <div className={`workspace-col-list ${mobileSubTab === 'list' ? 'mobile-visible' : 'mobile-hidden'}`}>
          <IdeaList 
            ideas={ideas} 
            onUpdateIdea={onUpdateIdea} 
            onDeleteIdea={onDeleteIdea} 
            aiCritiques={aiCritiques}
            aiCritiquesLoading={aiCritiquesLoading}
            onGetCritique={onGetCritique}
          />
        </div>
      </div>
    </div>
  );
}
