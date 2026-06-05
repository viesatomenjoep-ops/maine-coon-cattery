'use client';
import { createContext, useContext, useState, useCallback } from 'react';

// Mock auth — mirrors Supabase Auth session shape { user: { role } }.
// On migration, replace login/logout with supabase.auth.signInWithPassword / signOut.
const AuthContext = createContext(null);

const MOCK_USERS = {
  'klant@voorbeeld.nl': { password: 'kitten', role: 'customer', name: 'Familie de Vries' },
  'admin@maelduin.nl': { password: 'admin', role: 'admin', name: 'Cattery beheer' },
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const login = useCallback((email, password) => {
    const found = MOCK_USERS[email?.toLowerCase().trim()];
    if (found && found.password === password) {
      const session = { email, role: found.role, name: found.name };
      setUser(session);
      return { ok: true, role: found.role };
    }
    return { ok: false, error: 'Onjuiste inloggegevens.' };
  }, []);

  const logout = useCallback(() => setUser(null), []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
