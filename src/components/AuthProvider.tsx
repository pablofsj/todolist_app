import { useEffect, useState, type ReactNode } from 'react';

import { normalizeUsername, createUser, verifyUser } from '../lib/auth';
import { AuthContext, type AuthValue } from '../lib/auth-context';
import { getSessionUser, loadUsers, saveUsers, setSessionUser } from '../lib/storage';

const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;

    void getSessionUser()
      .then(async (session) => {
        if (!session) return;
        const users = await loadUsers();
        if (active && users.some((candidate) => candidate.username === session)) setUser(session);
      })
      .finally(() => {
        if (active) setReady(true);
      });

    return () => {
      active = false;
    };
  }, []);

  const login = async (username: string, password: string) => {
    const users = await loadUsers();
    if (!(await verifyUser(users, username, password))) {
      throw new Error('Usuario o contraseña incorrectos.');
    }

    const name = normalizeUsername(username);
    await setSessionUser(name);
    setUser(name);
  };

  const register = async (username: string, password: string) => {
    const users = await createUser(await loadUsers(), username, password);
    await saveUsers(users);

    const name = normalizeUsername(username);
    await setSessionUser(name);
    setUser(name);
  };

  const logout = async () => {
    await setSessionUser(null);
    setUser(null);
  };

  const value: AuthValue = { user, ready, login, register, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
