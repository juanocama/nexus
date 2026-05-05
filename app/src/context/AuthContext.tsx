import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getItemAsync, setItemAsync, deleteItemAsync, TOKEN_KEY, USER_KEY } from '@/utils/storage';

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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await getItemAsync(TOKEN_KEY);
      const storedUser = await getItemAsync(USER_KEY);

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

    await setItemAsync(TOKEN_KEY, String(accessToken));
    await setItemAsync(USER_KEY, JSON.stringify(userData));
    setToken(String(accessToken));
    setUser(userData);
  }, []);

  const logout = useCallback(async () => {
    await deleteItemAsync(TOKEN_KEY);
    await deleteItemAsync(USER_KEY);
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
