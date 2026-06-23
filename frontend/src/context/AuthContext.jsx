import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../api/client';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('gaspos_user');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      if (data.session?.user) {
        const authUser = mapSupabaseUser(data.session.user);
        localStorage.setItem('gaspos_token', data.session.access_token);
        localStorage.setItem('gaspos_user', JSON.stringify(authUser));
        setUser(authUser);
      }
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, nextSession) => {
      setSession(nextSession);
      if (nextSession?.user) {
        const authUser = mapSupabaseUser(nextSession.user);
        localStorage.setItem('gaspos_token', nextSession.access_token);
        localStorage.setItem('gaspos_user', JSON.stringify(authUser));
        setUser(authUser);
      } else if (event === 'SIGNED_OUT') {
        localStorage.removeItem('gaspos_user');
        localStorage.removeItem('gaspos_token');
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('gaspos_token', data.token);
    localStorage.setItem('gaspos_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const loginWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent'
        }
      }
    });

    if (error) throw error;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('gaspos_token');
    localStorage.removeItem('gaspos_user');
    setUser(null);
    setSession(null);
  };

  const value = useMemo(
    () => ({
      user,
      session,
      loading,
      login,
      loginWithGoogle,
      logout,
      isAuthenticated: Boolean(user || session)
    }),
    [user, session, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

function mapSupabaseUser(authUser) {
  return {
    id: authUser.id,
    name: authUser.user_metadata?.full_name || authUser.user_metadata?.name || authUser.email,
    email: authUser.email,
    role: authUser.user_metadata?.role || 'admin',
    avatar_url: authUser.user_metadata?.avatar_url
  };
}
