import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: (User & { funcao?: string }) | null;
  role: string | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<(User & { funcao?: string }) | null>(null);
  const [role, setRole] = useState<string | null>(null);

  const getUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase.from('perfis').select('funcao').eq('id', userId).maybeSingle();
      if (error || !data) return 'cliente';
      return data.funcao;
    } catch (err) {
      return 'cliente';
    }
  };

  const refreshSession = async () => {
    const { data: { user: authUser }, error } = await supabase.auth.getUser();
    if (authUser) {
      const role = await getUserRole(authUser.id);
      setUser({ ...authUser, funcao: role });
      setRole(role);
    } else {
      setUser(null);
      setRole(null);
    }
  };

  useEffect(() => {
    // Initial session check
    refreshSession();

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Evento de Auth:', event);
      
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setRole(null);
        return;
      }

      if (session?.user) {
        // Use getUser to verify the token
        const { data: { user: verifiedUser } } = await supabase.auth.getUser();
        if (verifiedUser) {
          const role = await getUserRole(verifiedUser.id);
          setUser({ ...verifiedUser, funcao: role });
          setRole(role);
        }
      } else {
        setUser(null);
        setRole(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    try {
      // Clear any stale session data before starting new login
      localStorage.removeItem('supabase.auth.token');
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'https://pi-2026-1-semestre.vercel.app/',
          queryParams: {
            prompt: 'select_account'
          }
        }
      });

      if (error) {
        toast.error(`Erro no login: ${error.message}`);
        throw error;
      }
    } catch (error: any) {
      console.error('Error signing in with Google:', error);
      toast.error(error.message || 'Falha ao iniciar login com Google');
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.clear();
      setUser(null);
      setRole(null);
      window.location.href = '/';
    } catch (error: any) {
      console.error('Error signing out:', error);
      localStorage.clear();
      setUser(null);
      setRole(null);
      window.location.href = '/';
    }
  };

  return (
    <AuthContext.Provider value={{ user, role, signInWithGoogle, signOut, refreshSession }}>
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
