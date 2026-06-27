'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

// Supabase Auth Context
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Check local bypass first
    const bypassed = localStorage.getItem('cattery_bypass_auth');
    if (bypassed) {
      setUser(JSON.parse(bypassed));
      setIsInitialized(true);
      return;
    }

    // Check active session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!bypassed) setUser(session?.user || null);
      setIsInitialized(true);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!localStorage.getItem('cattery_bypass_auth')) {
        setUser(session?.user || null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email, password) => {
    // BYPASS AUTHENTICATION AS REQUESTED BY USER
    const sessionUser = { role: 'admin', email: email || 'admin@wendysdreams.nl', name: 'Cattery beheer' };
    setUser(sessionUser);
    localStorage.setItem('cattery_bypass_auth', JSON.stringify(sessionUser));
    return { ok: true, role: 'admin' };
    
    /* ORIGINELE SUPABASE AUTH CODE:
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    
    if (error) {
      return { ok: false, error: 'Onjuiste inloggegevens of account bestaat niet.' };
    }
    
    return { ok: true, role: 'admin' };
    */
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem('cattery_bypass_auth');
    await supabase.auth.signOut();
  };

  // Wacht met renderen totdat we weten of iemand nog is ingelogd (voorkomt onnodige kicks naar /login)
  if (!isInitialized) return <div className="min-h-screen bg-cream-50" />;

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
