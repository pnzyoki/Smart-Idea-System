import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Detect if we have actual valid Supabase configuration
export const isSupabaseConfigured = 
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'YOUR_SUPABASE_URL' && 
  supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY';

let supabaseInstance = null;
if (isSupabaseConfigured) {
  try {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
    console.log('🔌 Supabase initialized successfully!');
  } catch (error) {
    console.error('❌ Failed to initialize Supabase client:', error);
  }
} else {
  console.log('⚡ Running in Local Sandbox Mode (Local Storage fallback). Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env to connect to live Supabase!');
}

export const supabase = supabaseInstance;

// ==========================================
// 1. DUAL-MODE AUTH SERVICE
// ==========================================

// Mock subscriber collection for auth state changes
const authSubscribers = new Set();

const triggerAuthChange = (event, session) => {
  authSubscribers.forEach(callback => callback(event, session));
};

export const authService = {
  signUp: async (email, password) => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      return data;
    } else {
      // Mock Sign Up
      await new Promise(resolve => setTimeout(resolve, 600)); // Simulate lag
      const users = JSON.parse(localStorage.getItem('smart_ideas_users') || '[]');
      
      if (users.some(u => u.email === email.toLowerCase())) {
        throw new Error('User already exists');
      }

      const newUser = {
        id: 'mock-user-' + Math.random().toString(36).substr(2, 9),
        email: email.toLowerCase(),
        password: password // In a real app we hash, this is local sandbox fallback
      };
      users.push(newUser);
      localStorage.setItem('smart_ideas_users', JSON.stringify(users));

      // Auto login after sign up
      const mockSession = { user: { id: newUser.id, email: newUser.email } };
      localStorage.setItem('smart_ideas_session', JSON.stringify(mockSession));
      triggerAuthChange('SIGNED_IN', mockSession);
      return mockSession;
    }
  },

  signIn: async (email, password) => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return data;
    } else {
      // Mock Sign In
      await new Promise(resolve => setTimeout(resolve, 600));
      const users = JSON.parse(localStorage.getItem('smart_ideas_users') || '[]');
      const user = users.find(u => u.email === email.toLowerCase() && u.password === password);

      if (!user) {
        throw new Error('Invalid email or password');
      }

      const mockSession = { user: { id: user.id, email: user.email } };
      localStorage.setItem('smart_ideas_session', JSON.stringify(mockSession));
      triggerAuthChange('SIGNED_IN', mockSession);
      return mockSession;
    }
  },

  signOut: async () => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } else {
      // Mock Sign Out
      localStorage.removeItem('smart_ideas_session');
      triggerAuthChange('SIGNED_OUT', null);
    }
  },

  getUser: async () => {
    if (isSupabaseConfigured && supabase) {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) return null;
      return user;
    } else {
      const sessionRaw = localStorage.getItem('smart_ideas_session');
      if (!sessionRaw) return null;
      try {
        const session = JSON.parse(sessionRaw);
        return session.user;
      } catch {
        return null;
      }
    }
  },

  onAuthStateChange: (callback) => {
    if (isSupabaseConfigured && supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        callback(event, session);
      });
      return () => subscription.unsubscribe();
    } else {
      // Mock Auth Subscription
      authSubscribers.add(callback);
      
      // Call immediately with initial session
      const sessionRaw = localStorage.getItem('smart_ideas_session');
      if (sessionRaw) {
        try {
          const session = JSON.parse(sessionRaw);
          callback('SIGNED_IN', session);
        } catch {
          callback('SIGNED_OUT', null);
        }
      } else {
        callback('SIGNED_OUT', null);
      }

      return () => {
        authSubscribers.delete(callback);
      };
    }
  }
};

// ==========================================
// 2. DUAL-MODE DATABASE SERVICE
// ==========================================

export const dbService = {
  getIdeas: async (userId) => {
    if (!userId) return [];

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('ideas')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } else {
      // Mock Database fetch
      await new Promise(resolve => setTimeout(resolve, 400));
      const allIdeas = JSON.parse(localStorage.getItem('smart_ideas_data') || '[]');
      return allIdeas.filter(idea => idea.user_id === userId);
    }
  },

  createIdea: async (idea, userId) => {
    const newIdea = {
      ...idea,
      user_id: userId,
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('ideas')
        .insert(newIdea)
        .select();

      if (error) throw error;
      return data[0];
    } else {
      // Mock Database insert
      await new Promise(resolve => setTimeout(resolve, 300));
      const allIdeas = JSON.parse(localStorage.getItem('smart_ideas_data') || '[]');
      
      const savedIdea = {
        ...newIdea,
        id: 'mock-idea-' + Math.random().toString(36).substr(2, 9)
      };
      
      allIdeas.unshift(savedIdea);
      localStorage.setItem('smart_ideas_data', JSON.stringify(allIdeas));
      return savedIdea;
    }
  },

  updateIdea: async (ideaId, updates) => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('ideas')
        .update(updates)
        .eq('id', ideaId)
        .select();

      if (error) throw error;
      return data[0];
    } else {
      // Mock Database update
      await new Promise(resolve => setTimeout(resolve, 300));
      const allIdeas = JSON.parse(localStorage.getItem('smart_ideas_data') || '[]');
      const index = allIdeas.findIndex(idea => idea.id === ideaId);
      
      if (index === -1) throw new Error('Idea not found');
      
      const updatedIdea = { ...allIdeas[index], ...updates };
      allIdeas[index] = updatedIdea;
      localStorage.setItem('smart_ideas_data', JSON.stringify(allIdeas));
      return updatedIdea;
    }
  },

  deleteIdea: async (ideaId) => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('ideas')
        .delete()
        .eq('id', ideaId);

      if (error) throw error;
      return true;
    } else {
      // Mock Database delete
      await new Promise(resolve => setTimeout(resolve, 200));
      const allIdeas = JSON.parse(localStorage.getItem('smart_ideas_data') || '[]');
      const filtered = allIdeas.filter(idea => idea.id !== ideaId);
      localStorage.setItem('smart_ideas_data', JSON.stringify(filtered));
      return true;
    }
  }
};
