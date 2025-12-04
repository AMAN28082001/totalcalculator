// Simple authentication configuration
// In production, use environment variables and proper authentication

export const AUTH_CONFIG = {
  admin: {
    username: 'admin',
    password: 'admin123'
  },
  agent: {
    username: 'agent',
    password: 'agent123'
  }
};

export type UserRole = 'admin' | 'agent' | 'customer' | 'sales';

export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('isAuthenticated') === 'true';
};

export const getUserRole = (): UserRole | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('userRole') as UserRole | null;
};

export const setUserRole = (role: UserRole): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('userRole', role);
  }
};

export const login = (username: string, password: string): 'admin' | 'agent' | null => {
  if (username === AUTH_CONFIG.admin.username && password === AUTH_CONFIG.admin.password) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userRole', 'admin');
    }
    return 'admin';
  }
  if (username === AUTH_CONFIG.agent.username && password === AUTH_CONFIG.agent.password) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userRole', 'agent');
    }
    return 'agent';
  }
  return null;
};

export const logout = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    localStorage.removeItem('agentMode');
  }
};

