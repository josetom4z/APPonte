import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types';
import { authService } from '../services/auth.service';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updatedUser: Partial<User>) => void;
  isCitizen: boolean;
  isOperator: boolean;
  isSecretary: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isStaff: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('apponte_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('apponte_token');
      if (token) {
        try {
          const profile = await authService.getMe();
          setUser(profile);
          localStorage.setItem('apponte_user', JSON.stringify(profile));
        } catch (err) {
          console.error('Failed to fetch user profile:', err);
          setUser(null);
          localStorage.removeItem('apponte_token');
          localStorage.removeItem('apponte_refresh_token');
          localStorage.removeItem('apponte_user');
        }
      }
      setIsLoading(false);
    };

    checkAuth();

    const handleLogoutEvent = () => {
      setUser(null);
    };
    window.addEventListener('apponte_logout', handleLogoutEvent);
    return () => window.removeEventListener('apponte_logout', handleLogoutEvent);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authService.login({ email, password });
      localStorage.setItem('apponte_token', response.accessToken);
      localStorage.setItem('apponte_refresh_token', response.refreshToken);
      localStorage.setItem('apponte_user', JSON.stringify(response.user));
      setUser(response.user);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: any) => {
    setIsLoading(true);
    try {
      const response = await authService.register(data);
      localStorage.setItem('apponte_token', response.accessToken);
      localStorage.setItem('apponte_refresh_token', response.refreshToken);
      localStorage.setItem('apponte_user', JSON.stringify(response.user));
      setUser(response.user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('apponte_refresh_token');
    try {
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
    } catch (e) {
      // Ignore
    } finally {
      localStorage.removeItem('apponte_token');
      localStorage.removeItem('apponte_refresh_token');
      localStorage.removeItem('apponte_user');
      setUser(null);
    }
  };

  const updateUser = (updated: Partial<User>) => {
    if (user) {
      const newUser = { ...user, ...updated };
      setUser(newUser);
      localStorage.setItem('apponte_user', JSON.stringify(newUser));
    }
  };

  const isCitizen = user?.role === 'CITIZEN';
  const isOperator = user?.role === 'OPERATOR';
  const isSecretary = user?.role === 'SECRETARY';
  const isAdmin = user?.role === 'ADMIN';
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const isStaff = ['OPERATOR', 'SECRETARY', 'ADMIN', 'SUPER_ADMIN'].includes(user?.role || '');

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateUser,
        isCitizen,
        isOperator,
        isSecretary,
        isAdmin,
        isSuperAdmin,
        isStaff,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
