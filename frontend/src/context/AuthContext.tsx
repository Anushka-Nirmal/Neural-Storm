import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, RoleName } from '../types';
import { api, getToken, setToken, removeToken, getStoredUser, setStoredUser } from '../services/api';

interface AuthContextType {
  user: User | null;
  role: RoleName | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithDemo: (role: RoleName) => Promise<void> | void;
  register: (data: any) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(getStoredUser());
  const [token, setTokenState] = useState<string | null>(getToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const role: RoleName | null = user?.roles?.[0]?.role || null;

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = getToken();
      if (savedToken) {
        try {
          const userData = await api.get<User>('/auth/me');
          setUser(userData);
          setStoredUser(userData);
        } catch (e) {
          // If token expired or offline, retain stored user for demo responsiveness
          const stored = getStoredUser();
          if (stored) setUser(stored);
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await api.post<{ access_token: string; user: User }>('/auth/login', { email, password });
      setToken(res.access_token);
      setStoredUser(res.user);
      setTokenState(res.access_token);
      setUser(res.user);
    } catch (err) {
      throw err;
    }
  };

  const loginWithDemo = async (demoRole: RoleName) => {
    const demoCredentials: Record<RoleName, { email: string; pass: string }> = {
      citizen: { email: 'citizen@jansahayak.gov.in', pass: 'CitizenPassword@2026' },
      department_officer: { email: 'officer.water@jansahayak.gov.in', pass: 'StaffPassword@2026' },
      department_head: { email: 'head.water@jansahayak.gov.in', pass: 'StaffPassword@2026' },
      system_admin: { email: 'admin@jansahayak.gov.in', pass: 'AdminPassword@2026' },
    };

    const creds = demoCredentials[demoRole];
    if (creds) {
      try {
        await login(creds.email, creds.pass);
        return;
      } catch (err) {
        console.warn('Backend login fallback to offline state:', err);
      }
    }

    const demoAccounts: Record<RoleName, User> = {
      citizen: {
        id: 'demo-citizen-1',
        email: 'citizen@jansahayak.gov.in',
        full_name: 'Ramesh Kumar (Citizen)',
        preferred_language: 'hi',
        phone_number: '+91 98765 43210',
        account_status: 'active',
        roles: [{ role: 'citizen', department_id: null }],
        created_at: new Date().toISOString(),
      },
      department_officer: {
        id: 'demo-officer-1',
        email: 'officer.water@jansahayak.gov.in',
        full_name: 'Amit Verma (Field Officer)',
        preferred_language: 'en',
        account_status: 'active',
        roles: [{ role: 'department_officer', department_id: 'd1' }],
        created_at: new Date().toISOString(),
      },
      department_head: {
        id: 'demo-head-1',
        email: 'head.water@jansahayak.gov.in',
        full_name: 'Dr. Sunita Deshmukh (Dept Head)',
        preferred_language: 'mr',
        account_status: 'active',
        roles: [{ role: 'department_head', department_id: 'd1' }],
        created_at: new Date().toISOString(),
      },
      system_admin: {
        id: 'demo-admin-1',
        email: 'admin@jansahayak.gov.in',
        full_name: 'Rajesh Sharma (System Admin)',
        preferred_language: 'en',
        account_status: 'active',
        roles: [{ role: 'system_admin', department_id: null }],
        created_at: new Date().toISOString(),
      },
    };

    const targetUser = demoAccounts[demoRole];
    const mockToken = `demo_jwt_token_${demoRole}_${Date.now()}`;
    setToken(mockToken);
    setStoredUser(targetUser);
    setTokenState(mockToken);
    setUser(targetUser);
  };

  const register = async (data: any) => {
    const res = await api.post<{ access_token: string; user: User }>('/auth/register', data);
    setToken(res.access_token);
    setStoredUser(res.user);
    setTokenState(res.access_token);
    setUser(res.user);
  };

  const logout = () => {
    removeToken();
    setTokenState(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        loginWithDemo,
        register,
        logout,
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
