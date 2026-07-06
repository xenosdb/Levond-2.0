import React, { createContext, useContext, useEffect, useState } from 'react';
import { authApi } from '@/lib/api';

const AuthContext = createContext(null);

function applyBranding(tenant) {
  if (!tenant) return;
  const root = document.documentElement;
  if (tenant.primary_color) root.style.setProperty('--brand-primary', tenant.primary_color);
  if (tenant.secondary_color) root.style.setProperty('--brand-secondary', tenant.secondary_color);
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [tenant, setTenantState] = useState(null);
  const [loading, setLoading] = useState(true);

  const setTenant = (t) => { setTenantState(t); applyBranding(t); };

  useEffect(() => {
    const token = localStorage.getItem('levond_token');
    if (!token) { setLoading(false); return; }
    authApi.me()
      .then((data) => { setUser(data.user); setTenant(data.tenant); })
      .catch(() => localStorage.removeItem('levond_token'))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const data = await authApi.login({ email, password });
    localStorage.setItem('levond_token', data.token);
    setUser(data.user); setTenant(data.tenant);
    return data;
  };

  const signup = async (payload) => {
    const data = await authApi.signup(payload);
    localStorage.setItem('levond_token', data.token);
    setUser(data.user); setTenant(data.tenant);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('levond_token');
    setUser(null); setTenantState(null);
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ user, tenant, loading, login, signup, logout, setTenant }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be in AuthProvider');
  return ctx;
};
