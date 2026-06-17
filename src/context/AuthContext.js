'use client';
import { createContext, useContext, useState, useCallback, useEffect } from 'react';

// Mock auth — mirrors Supabase Auth session shape { user: { role } }.
// On migration, replace login/logout with supabase.auth.signInWithPassword / signOut.
const AuthContext = createContext(null);

const MOCK_USERS = {
  'admin@wendysdreams.nl': { password: 'admin', role: 'admin', name: 'Cattery beheer' },
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Laad opgeslagen inloggegevens bij het openen van de app
    const stored = localStorage.getItem('cattery_mock_auth');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch (e) {
        console.error("Fout bij ophalen inloggegevens");
      }
    }
    setIsInitialized(true);
  }, []);

  const login = useCallback((email, password) => {
    const found = MOCK_USERS[email?.toLowerCase().trim()];
    if (found && found.password === password) {
      const session = { email, role: found.role, name: found.name };
      setUser(session);
      // Bewaar lokaal
      localStorage.setItem('cattery_mock_auth', JSON.stringify(session));
      return { ok: true, role: found.role };
    }
    return { ok: false, error: 'Onjuiste inloggegevens.' };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('cattery_mock_auth');
  }, []);

  // Wacht met renderen totdat we weten of iemand nog is ingelogd (voorkomt onnodige kicks naar /login)
  if (!isInitialized) return <div className="min-h-screen bg-cream-50" />;

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
