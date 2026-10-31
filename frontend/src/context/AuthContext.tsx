import React, { createContext, useContext, useState, useEffect } from 'react';
import authService, { User, LoginRequest, RegisterRequest } from '../services/auth';
import businessService from '../services/business';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  activeBusinessId: string;
  setActiveBusinessId: (id: string) => void;
  login: (creds: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(authService.getToken());
  const [activeBusinessId, setActiveBusinessIdState] = useState<string>(
    businessService.getActiveBusinessId() || 'demo-kirana'
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const currentToken = authService.getToken();
      if (currentToken) {
        try {
          const profile = await authService.getCurrentUser();
          setUser(profile);
        } catch {
          // Token might be demo or offline
          setUser({ id: 'owner-1', email: 'owner@arthsetu.local', full_name: 'Ramesh Patel' });
        }
      } else {
        // Fallback demo user
        setUser({ id: 'owner-1', email: 'ramesh.patel@kirana.local', full_name: 'Ramesh Patel' });
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const setActiveBusinessId = (id: string) => {
    setActiveBusinessIdState(id);
    businessService.setActiveBusinessId(id);
  };

  const login = async (creds: LoginRequest) => {
    setIsLoading(true);
    try {
      const res = await authService.login(creds);
      setToken(res.access_token);
      if (res.user) {
        setUser(res.user);
      } else {
        const profile = await authService.getCurrentUser();
        setUser(profile);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterRequest) => {
    setIsLoading(true);
    try {
      await authService.register(data);
      await login({ username: data.email, password: data.password });
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token || !!user,
        activeBusinessId,
        setActiveBusinessId,
        login,
        register,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};

export default AuthContext;
