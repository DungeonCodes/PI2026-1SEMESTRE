import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: (User & { funcao?: string }) | null;
  role: string | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<(User & { funcao?: string }) | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async (authUser: User) => {
    try {
      const { data, error } = await supabase
        .from('perfis')
        .select('funcao')
        .eq('id', authUser.id)
        .single();
      
      const userRole = data?.funcao || 'cliente';
      if (error) {
        console.error('Error fetching user profile:', error);
      }
      
      setRole(userRole);
      setUser({ ...authUser, funcao: userRole });
    } catch (err) {
      console.error('Unexpected error fetching profile:', err);
      setRole('cliente');
      setUser({ ...authUser, funcao: 'cliente' });
    } finally {
      setLoading(false);
    }
  };

  const refreshSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await fetchUserProfile(session.user);
    } else {
      setUser(null);
      setRole(null);
    }
  };

  useEffect(() => {
    // Initial check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUserProfile(session.user);
      } else {
        setLoading(false);
      }
    });

    // Real-time listener
    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await fetchUserProfile(session.user);
      } else {
        setUser(null);
        setRole(null);
        setLoading(false);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    try {
      // In the AI Studio preview environment, we must use a popup flow
      // to avoid iframe redirect issues.
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          // We'll use a dedicated callback page that handles postMessage
          redirectTo: `${window.location.origin}/auth-callback.html`,
          skipBrowserRedirect: true
        }
      });

      if (error) throw error;

      if (data?.url) {
        const width = 600;
        const height = 700;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;
        
        const popup = window.open(
          data.url,
          'google-oauth-popup',
          `width=${width},height=${height},left=${left},top=${top}`
        );

        if (!popup) {
          alert('Por favor, habilite popups para fazer login.');
        }
      }
    } catch (error: any) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error: any) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, signInWithGoogle, signOut, refreshSession }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
