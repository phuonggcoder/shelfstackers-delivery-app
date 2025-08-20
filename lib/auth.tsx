import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { shipperApi } from './shipperApi';

// Lightweight storage wrapper: try SecureStore first, fallback to AsyncStorage.
let SecureStore: any = null;
try {
  // require at runtime to avoid Metro/native init errors in certain dev environments
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  SecureStore = require('expo-secure-store');
} catch (e) {
  SecureStore = null;
}

async function safeGetItem(key: string) {
  if (SecureStore && SecureStore.getItemAsync) {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (e) {
      // ignore and fallback
    }
  }
  try {
    return await AsyncStorage.getItem(key);
  } catch (e) {
    return null;
  }
}

async function safeSetItem(key: string, value: string) {
  if (SecureStore && SecureStore.setItemAsync) {
    try {
      return await SecureStore.setItemAsync(key);
    } catch (e) {
      // ignore and fallback
    }
  }
  try {
    return await AsyncStorage.setItem(key, value);
  } catch (e) {
    return null;
  }
}

async function safeDeleteItem(key: string) {
  if (SecureStore && SecureStore.deleteItemAsync) {
    try {
      return await SecureStore.deleteItemAsync(key);
    } catch (e) {
      // ignore and fallback
    }
  }
  try {
    return await AsyncStorage.removeItem(key);
  } catch (e) {
    return null;
  }
}

const TOKEN_KEY = 'app_token';
const REFRESH_TOKEN_KEY = 'app_refresh_token';
const USER_KEY = 'app_user';

type User = any;

const AuthContext = createContext<{
  token: string | null;
  refreshToken: string | null;
  user: User | null;
  loading: boolean;
  signIn: (data: { token: string; refreshToken: string; user?: User }) => Promise<void>;
  signOut: () => Promise<void>;
  refreshAuthToken: () => Promise<boolean>;
}>({ 
  token: null, 
  refreshToken: null,
  user: null, 
  loading: true, 
  signIn: async () => {}, 
  signOut: async () => {},
  refreshAuthToken: async () => false
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const t = await safeGetItem(TOKEN_KEY);
        const rt = await safeGetItem(REFRESH_TOKEN_KEY);
        const uJson = await safeGetItem(USER_KEY);
        const u = uJson ? JSON.parse(uJson) : null;
        
        if (t) {
          setToken(t);
          shipperApi.setToken(t);
        }
        if (rt) {
          setRefreshToken(rt);
        }
        if (u) setUser(u);
      } catch (e) {
        console.warn('auth load failed', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function signIn({ token: t, refreshToken: rt, user: u }: { token: string; refreshToken: string; user?: User }) {
    setToken(t);
    setRefreshToken(rt);
    shipperApi.setToken(t);
    setUser(u || null);
    
    await safeSetItem(TOKEN_KEY, t);
    await safeSetItem(REFRESH_TOKEN_KEY, rt);
    if (u) await safeSetItem(USER_KEY, JSON.stringify(u));
  }

  async function signOut() {
    setToken(null);
    setRefreshToken(null);
    shipperApi.setToken(null);
    setUser(null);
    
    await safeDeleteItem(TOKEN_KEY);
    await safeDeleteItem(REFRESH_TOKEN_KEY);
    await safeDeleteItem(USER_KEY);
  }

  async function refreshAuthToken(): Promise<boolean> {
    if (!refreshToken) return false;
    
    try {
      const response = await shipperApi.refreshToken(refreshToken);
      if (response.success) {
        await signIn({
          token: response.access_token,
          refreshToken: response.refresh_token,
          user: user
        });
        return true;
      }
    } catch (error) {
      console.warn('Failed to refresh token:', error);
      // If refresh fails, sign out the user
      await signOut();
    }
    return false;
  }

  return (
    <AuthContext.Provider value={{ 
      token, 
      refreshToken,
      user, 
      loading, 
      signIn, 
      signOut,
      refreshAuthToken
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  return useContext(AuthContext);
}
