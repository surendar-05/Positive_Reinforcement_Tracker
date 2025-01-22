import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: any;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  loading: true,
  error: null,
  signIn: async (email: string, password: string) => {
    try {
      set({ error: null, loading: true });
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      set({ user: data.user, session: data.session });
    } catch (error) {
      let message = 'Invalid login credentials';
      if (error instanceof Error) {
        // Handle specific error cases
        if (error.message.includes('email_not_confirmed')) {
          message = 'Please check your email for the confirmation link';
        } else {
          message = error.message;
        }
      }
      set({ error: message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  signUp: async (email: string, password: string) => {
    try {
      set({ error: null, loading: true });
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            email: email,
          },
          emailRedirectTo: window.location.origin,
        }
      });
      if (error) throw error;
      
      // Auto sign in after signup since email confirmation is disabled
      if (data.user) {
        set({ user: data.user, session: data.session });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error creating account';
      set({ error: message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  signOut: async () => {
    try {
      set({ error: null, loading: true });
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      set({ user: null, session: null });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error signing out';
      set({ error: message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  initialize: async () => {
    try {
      set({ loading: true, error: null });
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      set({ user, loading: false });
    } catch (error) {
      set({ user: null, loading: false });
    }
  },
  clearError: () => set({ error: null }),
}));