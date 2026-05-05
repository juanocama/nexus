import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';

interface User {
  id: string;
  email: string;
  full_name: string;
  faculty?: string;
  phone?: string;
  profile_photo_url?: string;
  average_rating?: number;
  total_trips?: number;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

interface LoginResponse {
  accessToken: string;
  expiresIn: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (response: LoginResponse & Partial<User>) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isLoading: true,
  login: async () => {},
  logout: async () => {},
  isAuthenticated: false,
});

const TOKEN_KEY = 'nexus_auth_token';
const USER_KEY = 'nexus_auth_user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await SecureStore.getItemAsync(TOKEN_KEY);
      const storedUser = await SecureStore.getItemAsync(USER_KEY);

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Error loading auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = useCallback(async (response: LoginResponse & Partial<User>) => {
    const { accessToken, ...userFields } = response;
    const userData: User = {
      id: userFields.id || '',
      email: userFields.email || '',
      full_name: userFields.full_name || '',
      faculty: userFields.faculty,
      phone: userFields.phone,
      profile_photo_url: userFields.profile_photo_url,
      average_rating: userFields.average_rating,
      total_trips: userFields.total_trips,
      status: userFields.status,
    };

    await SecureStore.setItemAsync(TOKEN_KEY, String(accessToken));
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(userData));
    setToken(String(accessToken));
    setUser(userData);
  }, []);

  const logout = useCallback(async () => {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    } catch {}
    try {
      await SecureStore.deleteItemAsync(USER_KEY);
    } catch {}
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        logout,
        isAuthenticated: !!token && !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
