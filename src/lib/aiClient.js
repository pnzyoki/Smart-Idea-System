/**
 * OpenAI GPT-4o-mini integration service with built-in sandbox mock fallbacks.
 */

const apiKey = import.meta.env.VITE_OPENAI_API_KEY || '';

export const isOpenAIConfigured = 
  apiKey && 
  apiKey !== 'YOUR_OPENAI_API_KEY' && 
  apiKey.trim() !== '';

/**
 * Sends a chat completion request directly to OpenAI.
 * Uses lightweight fetch requests to prevent importing large, heavy SDK dependencies.
 */
async function callOpenAI(messages, responseFormatJson = true) {
  try {
    const payload = {
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.7
    };

    if (responseFormatJson) {
      payload.response_format = { type: 'json_object' };
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error?.message || `HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (responseFormatJson) {
      return JSON.parse(content);
    }
    return content;
  } catch (error) {
    console.error('OpenAI Direct API error:', error);
    throw error;
  }
}

// ==========================================
// 1. SEMANTIC GROUPING & CLUSTERING
// ==========================================

export async function generateSemanticGroups(ideas) {
  if (ideas.length === 0) return [];

  if (isOpenAIConfigured) {
    try {
      const ideasData = ideas.map(i => ({
        id: i.id,
        title: i.title,
        description: i.description,
        category: i.category
      }));

      const systemPrompt = `You are a master business incubator strategist. Your task is to organize a list of brainstormed ideas into semantic themes or category clusters.
Return ONLY a valid JSON object in this exact shape:
{
  "groups": [
    {
      "folderName": "Clean and engaging folder title, e.g. Healthcare Automation",
      "folderTheme": "A 1-sentence description of what binds these ideas together",
      "ideaIds": ["idea-id-1", "idea-id-2"]
    }
  ]
}
Make sure every input idea ID is mapped to exactly one folder. Keep the number of folders balanced (usually between 2 and 5 folders depending on total ideas).`;

      const userPrompt = `Here are the ideas to group:\n${JSON.stringify(ideasData, null, 2)}`;

      const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ];

      const result = await callOpenAI(messages, true);
      return result.groups || [];
    } catch (err) {
      console.warn('Falling back to local Sandbox AI grouping due to OpenAI API error.', err);
      // fallback to mock
    }
  }

  // MOCK NLP Sandbox Grouping Fallback
  return mockSemanticGrouping(ideas);
}

// ==========================================
// 2. IDEA CRITIQUE & SCORE AUDITOR
// ==========================================

export async function generateIdeaFeedback(idea) {
  if (isOpenAIConfigured) {
    try {
      const systemPrompt = `You are an AI Startup Co-Pilot and product design expert. Review the user's idea and self-assessed scores (each parameter is on a 1-10 scale where 10 is max. For Effort, 10 means extremely complex/time-consuming).
Analyze their vision and provide constructive feedback.
Return ONLY a valid JSON object in this exact shape:
{
  "auditAgree": true or false,
  "suggestedScores": {
    "impact": 7,
    "feasibility": 8,
    "effort": 4
  },
  "auditCritique": "A brief 2-sentence explanation comparing the user's self-assessed scores to your suggestion.",
  "improvements": [
    "Actionable, technical improvement point 1 (max 15 words)",
    "Actionable, technical improvement point 2 (max 15 words)",
    "Actionable, technical improvement point 3 (max 15 words)"
  ]
}
Be critical but encouraging. Return exactly 3 concrete, short improvement bullets.`;

      const userPrompt = `Idea Title: ${idea.title}
Detailed Vision: ${idea.description}
Category: ${idea.category}

User Self-Assessment:
- Impact: ${idea.impact}/10
- Feasibility: ${idea.feasibility}/10
- Effort: ${idea.effort}/10`;

      const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ];

      const result = await callOpenAI(messages, true);
      return result;
    } catch (err) {
      console.warn('Falling back to local Sandbox AI feedback due to OpenAI API error.', err);
      // fallback to mock
    }
  }

  // MOCK AI Feedback Fallback
  return mockIdeaFeedback(idea);
}

// ==========================================
// LOCAL SANDBOX MOCK NLP ALGORITHMS
// ==========================================

async function mockSemanticGrouping(ideas) {
  await new Promise(resolve => setTimeout(resolve, 800)); // Simulate AI network delay

  const folders = {
    'Tech & AI Automation 💻': {
      folderTheme: 'Leveraging AI networks, coding tools, and software to optimize operations.',
      ideaIds: []
    },
    'Health & Lifestyle 🌱': {
      folderTheme: 'Innovations dedicated to personal health, diet, habits, and physical well-being.',
      ideaIds: []
    },
    'Business & Fintech 💼': {
      folderTheme: 'Ideas targeting marketing, productivity, commerce, and monetary gains.',
      ideaIds: []
    },
    'Art & Creative Media 🎨': {
      folderTheme: 'Design systems, creative content generation, and artistic tools.',
      ideaIds: []
    },
    'General Workspaces 💡': {
      folderTheme: 'Miscellaneous brainstorms addressing unique daily operations.',
      ideaIds: []
    }
  };

  ideas.forEach(idea => {
    const text = (idea.title + ' ' + idea.description).toLowerCase();
    
    if (text.includes('health') || text.includes('care') || text.includes('fit') || text.includes('diet') || text.includes('wellness') || text.includes('sport')) {
      folders['Health & Lifestyle 🌱'].ideaIds.push(idea.id);
    } else if (text.includes('code') || text.includes('ai') || text.includes('app') || text.includes('tech') || text.includes('soft') || text.includes('dev') || text.includes('web')) {
      folders['Tech & AI Automation 💻'].ideaIds.push(idea.id);
    } else if (text.includes('sell') || text.includes('shop') || text.includes('business') || text.includes('pay') || text.includes('fin') || text.includes('market') || text.includes('money')) {
      folders['Business & Fintech 💼'].ideaIds.push(idea.id);
    } else if (text.includes('write') || text.includes('art') || text.includes('paint') || text.includes('design') || text.includes('music') || text.includes('creative')) {
      folders['Art & Creative Media 🎨'].ideaIds.push(idea.id);
    } else {
      folders['General Workspaces 💡'].ideaIds.push(idea.id);
    }
  });

  // Filter out folders that have 0 ideas inside
  return Object.entries(folders)
    .filter(([, data]) => data.ideaIds.length > 0)
    .map(([name, data]) => ({
      folderName: name,
      folderTheme: data.folderTheme,
      ideaIds: data.ideaIds
    }));
}

async function mockIdeaFeedback(idea) {
  await new Promise(resolve => setTimeout(resolve, 600)); // Simulate delay

  const imp = parseInt(idea.impact) || 5;
  const feas = parseInt(idea.feasibility) || 5;
  const eff = parseInt(idea.effort) || 5;

  let auditAgree = true;
  let suggestedScores = { impact: imp, feasibility: feas, effort: eff };
  let auditCritique = `The self-assessed scores match the scope. Your impact rating of ${imp}/10 reflects solid market potential.`;
  let improvements = [
    'Define an immediate MVP to prove customer interest.',
    'Build high-fidelity wireframes to review layout design.',
    'Establish pricing tiers or a freemium model early.'
  ];

  // Make mock suggestions based on inputs
  if (eff >= 7) {
    auditAgree = false;
    suggestedScores.effort = Math.max(1, eff - 2);
    auditCritique = `We suggest trimming the effort from ${eff}/10 to ${suggestedScores.effort}/10 by limiting initial requirements. Your description hints at standard SaaS tools which can be built using existing templates.`;
    improvements = [
      'Scaffold using pre-made boilerplates to reduce code writing.',
      'Deploy on serverless providers like Vercel to cut operations costs.',
      'Adopt a simple database structure to minimize backend overhead.'
    ];
  } else if (feas <= 4) {
    auditAgree = false;
    suggestedScores.feasibility = Math.min(10, feas + 2);
    auditCritique = `We audit the feasibility from a low ${feas}/10 up to ${suggestedScores.feasibility}/10. The core tech is mature and easily accessible through standard libraries.`;
    improvements = [
      'Utilize open-source npm libraries for rapid features hookup.',
      'Employ drag-and-drop components to mock the interface.',
      'Rely on established local cache storage to save database costs.'
    ];
  } else if (imp <= 4) {
    auditAgree = false;
    suggestedScores.impact = Math.min(10, imp + 3);
    auditCritique = `Your impact rating of ${imp}/10 is conservative. Adding scalable components could boost its strategic value to ${suggestedScores.impact}/10.`;
    improvements = [
      'Target niche developer segments to build loyal initial audiences.',
      'Integrate collaborative multi-user features to trigger word-of-mouth.',
      'Structure clean CSV exports to sync data with other workspace products.'
    ];
  }

  return {
    auditAgree,
    suggestedScores,
    auditCritique,
    improvements
  };
}
