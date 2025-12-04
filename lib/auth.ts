// Simple authentication configuration
// In production, use environment variables and proper authentication

export const AUTH_CONFIG = {
  username: 'admin',
  password: 'admin123' // Change this in production
};

export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('isAuthenticated') === 'true';
};

export const login = (username: string, password: string): boolean => {
  if (username === AUTH_CONFIG.username && password === AUTH_CONFIG.password) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('isAuthenticated', 'true');
    }
    return true;
  }
  return false;
};

export const logout = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('isAuthenticated');
  }
};

