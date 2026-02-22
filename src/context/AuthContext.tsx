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

  const getUserRole = async (userId: string) => {
    try {
      // Usando maybeSingle() para evitar erros se a linha não existir
      const { data, error } = await supabase.from('perfis').select('funcao').eq('id', userId).maybeSingle();
      if (error || !data) return 'cliente';
      return data.funcao;
    } catch (err) {
      return 'cliente';
    }
  };

  const refreshSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const role = await getUserRole(session.user.id);
      setUser({ ...session.user, funcao: role });
      setRole(role);
    } else {
      setUser(null);
      setRole(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    // 1. Pega a sessão inicial imediatamente da URL/Storage
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const role = await getUserRole(session.user.id);
        setUser({ ...session.user, funcao: role });
        setRole(role);
      }
      setLoading(false);
    });

    // 2. Escuta mudanças em tempo real
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth event:', event);
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        if (session?.user) {
          const role = await getUserRole(session.user.id);
          setUser({ ...session.user, funcao: role });
          setRole(role);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth-callback.html`,
          skipBrowserRedirect: true,
          queryParams: {
            prompt: 'select_account'
          }
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
      await supabase.auth.signOut();
      setUser(null);
      setRole(null);
      window.location.href = '/';
    } catch (error: any) {
      console.error('Error signing out:', error);
      // Fallback cleanup
      setUser(null);
      setRole(null);
      window.location.href = '/';
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
