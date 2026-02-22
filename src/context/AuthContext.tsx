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
      // Não use .single() para evitar throw de erro se a linha não existir ainda
      const { data, error } = await supabase
        .from('perfis')
        .select('funcao')
        .eq('id', authUser.id);
      
      if (error) throw error;
      
      // Pega a função ou assume 'cliente' como fallback seguro
      const userRole = (data && data.length > 0) ? data[0].funcao : 'cliente';
      
      console.log('Usuário logado:', { ...authUser, funcao: userRole });
      setRole(userRole);
      setUser({ ...authUser, funcao: userRole });
    } catch (err) {
      console.error("Erro ao buscar cargo, forçando acesso de cliente:", err);
      setRole('cliente');
      setUser({ ...authUser, funcao: 'cliente' }); // Fallback crítico
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
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial check
    refreshSession();

    // Real-time listener
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth event:', event);
      
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'TOKEN_REFRESHED') {
        if (session?.user) {
          await fetchUserProfile(session.user);
        }
      } else if (event === 'SIGNED_OUT') {
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
