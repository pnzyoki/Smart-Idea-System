import { useState, useEffect, useCallback } from 'react';
import { dbService } from '../lib/supabaseClient';
import { calculateSmartScore, classifyQuadrant } from '../lib/scoring';
import { generateSemanticGroups, generateIdeaFeedback } from '../lib/aiClient';

export function useIdeas(user) {
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activities, setActivities] = useState([]);
  
  // AI-Specific States
  const [aiGroups, setAiGroups] = useState([]);
  const [aiGroupsLoading, setAiGroupsLoading] = useState(false);
  const [aiCritiques, setAiCritiques] = useState({});
  const [aiCritiquesLoading, setAiCritiquesLoading] = useState({});

  // Fetch all ideas for current user
  const fetchIdeas = useCallback(async () => {
    if (!user) {
      setIdeas([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await dbService.getIdeas(user.id);
      setIdeas(data);
    } catch (err) {
      console.error('Error fetching ideas:', err);
      setError('Failed to fetch ideas.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Load ideas, activities, and AI caches on login/refresh
  useEffect(() => {
    const timer = setTimeout(() => {
      if (user) {
        // 1. Load activities
        const allActivities = JSON.parse(localStorage.getItem('smart_ideas_activities') || '[]');
        const userActivities = allActivities.filter(act => act.userId === user.id);
        setActivities(userActivities);

        // 2. Load cached AI groupings
        const cachedGroups = JSON.parse(localStorage.getItem(`smart_ideas_ai_groups_${user.id}`) || '[]');
        setAiGroups(cachedGroups);

        // 3. Load cached AI critiques
        const cachedCritiques = JSON.parse(localStorage.getItem(`smart_ideas_ai_critiques_${user.id}`) || '{}');
        setAiCritiques(cachedCritiques);

        // Fetch database ideas
        fetchIdeas();
      } else {
        setIdeas([]);
        setActivities([]);
        setAiGroups([]);
        setAiCritiques({});
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [user, fetchIdeas]);

  // Unified activity logger
  const logActivity = useCallback((type, text) => {
    if (!user) return;
    const allActivities = JSON.parse(localStorage.getItem('smart_ideas_activities') || '[]');
    
    const newActivity = {
      id: 'activity-' + Math.random().toString(36).substr(2, 9),
      userId: user.id,
      type, // 'create' | 'update' | 'delete' | 'system'
      text,
      timestamp: new Date().toISOString()
    };
    
    allActivities.unshift(newActivity);
    localStorage.setItem('smart_ideas_activities', JSON.stringify(allActivities));
    setActivities(prev => [newActivity, ...prev]);
  }, [user]);

  // CREATE Idea
  const addIdea = async (ideaData) => {
    if (!user) return null;
    setError(null);
    try {
      const score = calculateSmartScore(ideaData.impact, ideaData.feasibility, ideaData.effort);
      const quadrant = classifyQuadrant(ideaData.impact, ideaData.feasibility, ideaData.effort);
      
      const payload = {
        title: ideaData.title,
        description: ideaData.description,
        category: ideaData.category,
        impact: parseInt(ideaData.impact),
        feasibility: parseInt(ideaData.feasibility),
        effort: parseInt(ideaData.effort),
        score,
        quadrant
      };

      const result = await dbService.createIdea(payload, user.id);
      setIdeas(prev => [result, ...prev]);
      logActivity('create', `Added new idea: "${payload.title}" (${quadrant})`);
      return result;
    } catch (err) {
      console.error('Error adding idea:', err);
      setError('Failed to add idea.');
      throw err;
    }
  };

  // UPDATE Idea
  const updateIdea = async (ideaId, updates) => {
    if (!user) return null;
    setError(null);
    try {
      // If we are updating scores, recalculate overall score & quadrant
      let finalUpdates = { ...updates };
      const currentIdea = ideas.find(i => i.id === ideaId);
      
      if (currentIdea) {
        const impact = updates.impact !== undefined ? updates.impact : currentIdea.impact;
        const feasibility = updates.feasibility !== undefined ? updates.feasibility : currentIdea.feasibility;
        const effort = updates.effort !== undefined ? updates.effort : currentIdea.effort;
        
        if (updates.impact !== undefined || updates.feasibility !== undefined || updates.effort !== undefined) {
          finalUpdates.score = calculateSmartScore(impact, feasibility, effort);
          finalUpdates.quadrant = classifyQuadrant(impact, feasibility, effort);
        }
      }

      const result = await dbService.updateIdea(ideaId, finalUpdates);
      setIdeas(prev => prev.map(item => item.id === ideaId ? result : item));
      logActivity('update', `Updated idea: "${result.title}"`);
      
      // If cached AI feedback exists, clear it so it will be audited again with new scores
      if (aiCritiques[ideaId]) {
        const updatedCritiques = { ...aiCritiques };
        delete updatedCritiques[ideaId];
        setAiCritiques(updatedCritiques);
        localStorage.setItem(`smart_ideas_ai_critiques_${user.id}`, JSON.stringify(updatedCritiques));
      }

      return result;
    } catch (err) {
      console.error('Error updating idea:', err);
      setError('Failed to update idea.');
      throw err;
    }
  };

  // DELETE Idea
  const deleteIdea = async (ideaId) => {
    if (!user) return false;
    setError(null);
    try {
      const ideaToDelete = ideas.find(i => i.id === ideaId);
      await dbService.deleteIdea(ideaId);
      setIdeas(prev => prev.filter(item => item.id !== ideaId));
      
      if (ideaToDelete) {
        logActivity('delete', `Archived/Deleted idea: "${ideaToDelete.title}"`);
      }

      // Cleanup local storage critique cache
      if (aiCritiques[ideaId]) {
        const updatedCritiques = { ...aiCritiques };
        delete updatedCritiques[ideaId];
        setAiCritiques(updatedCritiques);
        localStorage.setItem(`smart_ideas_ai_critiques_${user.id}`, JSON.stringify(updatedCritiques));
      }

      return true;
    } catch (err) {
      console.error('Error deleting idea:', err);
      setError('Failed to delete idea.');
      return false;
    }
  };

  // ==========================================
  // AI RUN FUNCTIONS
  // ==========================================

  // Trigger Dynamic OpenAI Categorization Grouping
  const runAIGrouping = async () => {
    if (!user || ideas.length === 0) return;
    setAiGroupsLoading(true);
    try {
      const groups = await generateSemanticGroups(ideas);
      setAiGroups(groups);
      localStorage.setItem(`smart_ideas_ai_groups_${user.id}`, JSON.stringify(groups));
      logActivity('system', `AI Analysis: Structured ${ideas.length} ideas into semantic clusters.`);
    } catch (err) {
      console.error('AI Grouping failed:', err);
    } finally {
      setAiGroupsLoading(false);
    }
  };

  // Trigger Dynamic OpenAI Card Audit Feedback
  const getCardCritique = async (ideaId) => {
    if (!user) return;
    
    // Check if critique already exists in cache
    if (aiCritiques[ideaId]) {
      return aiCritiques[ideaId];
    }

    const idea = ideas.find(i => i.id === ideaId);
    if (!idea) return null;

    setAiCritiquesLoading(prev => ({ ...prev, [ideaId]: true }));
    try {
      const feedback = await generateIdeaFeedback(idea);
      
      const updatedCritiques = {
        ...aiCritiques,
        [ideaId]: feedback
      };
      
      setAiCritiques(updatedCritiques);
      localStorage.setItem(`smart_ideas_ai_critiques_${user.id}`, JSON.stringify(updatedCritiques));
      logActivity('system', `AI Co-Pilot: Reviewed and audited scores for "${idea.title}".`);
      return feedback;
    } catch (err) {
      console.error('AI Card critique failed:', err);
      return null;
    } finally {
      setAiCritiquesLoading(prev => ({ ...prev, [ideaId]: false }));
    }
  };

  return {
    ideas,
    activities,
    loading,
    error,
    addIdea,
    updateIdea,
    deleteIdea,
    refreshIdeas: fetchIdeas,
    logActivity,
    
    // AI Operations
    aiGroups,
    aiGroupsLoading,
    runAIGrouping,
    aiCritiques,
    aiCritiquesLoading,
    getCardCritique
  };
}
