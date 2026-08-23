'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

// Supabase Auth Context
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Check active session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      setIsInitialized(true);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      return { ok: false, error: 'Onjuiste inloggegevens of account bestaat niet.' };
    }

    return { ok: true, role: 'admin' };
  };

  // Zelf registreren met een los e-mailadres (geen Google/Apple nodig). Als
  // e-mailbevestiging aanstaat in Supabase krijg je meteen na het klikken op
  // de link in je mail een sessie; anders (bevestiging uit) meteen hier al.
  const signUp = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      if (/already registered|already exists/i.test(error.message)) {
        return { ok: false, error: 'Er bestaat al een account met dit e-mailadres. Log in plaats daarvan in.' };
      }
      return { ok: false, error: 'Registreren is niet gelukt: ' + error.message };
    }
    // Sommige Supabase-projecten vereisen e-mailbevestiging — dan is er nog geen sessie.
    return { ok: true, needsConfirmation: !data.session };
  };

  // Inloggen met een Google-/Gmail-account. Supabase stuurt de gebruiker naar
  // Google en daarna terug naar /auth/callback, die bepaalt waar hij hoort.
  const loginWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: { access_type: 'offline', prompt: 'select_account' },
      },
    });
    if (error) return { ok: false, error: 'Inloggen met Google is niet gelukt. Probeer het opnieuw.' };
    return { ok: true };
  };

  const logout = async () => {
    setUser(null);
    await supabase.auth.signOut();
  };

  // Wacht met renderen totdat we weten of iemand nog is ingelogd (voorkomt onnodige kicks naar /login)
  // Dit blokkeerde de hele website rendering, nu verwijderd omdat middleware dit opvangt.

  return (
    <AuthContext.Provider value={{ user, login, signUp, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
