import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('pf_user')); } 
    catch { return null; }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('pf_token');
    if (token) {
      authService.getMe()
        .then(({ data }) => setUser(data.user))
        .catch(() => { localStorage.removeItem('pf_token'); localStorage.removeItem('pf_user'); setUser(null); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const { data } = await authService.login({ email, password });
    localStorage.setItem('pf_token', data.token);
    localStorage.setItem('pf_user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  const signup = async (name, email, password, role) => {
    const { data } = await authService.signup({ name, email, password, role });
    localStorage.setItem('pf_token', data.token);
    localStorage.setItem('pf_user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('pf_token');
    localStorage.removeItem('pf_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, isAdmin: user?.role === 'Admin' }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
