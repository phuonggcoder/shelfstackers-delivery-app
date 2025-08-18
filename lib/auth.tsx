import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
      return await SecureStore.setItemAsync(key, value);
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
import { shipperApi } from './shipperApi';

const TOKEN_KEY = 'app_token';
const USER_KEY = 'app_user';

type User = any;

const AuthContext = createContext<{
  token: string | null;
  user: User | null;
  loading: boolean;
  signIn: (data: { token: string; user?: User }) => Promise<void>;
  signOut: () => Promise<void>;
}>({ token: null, user: null, loading: true, signIn: async () => {}, signOut: async () => {} });

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const t = await safeGetItem(TOKEN_KEY);
        const uJson = await safeGetItem(USER_KEY);
        const u = uJson ? JSON.parse(uJson) : null;
        if (t) {
          setToken(t);
          shipperApi.setToken(t);
        }
        if (u) setUser(u);
      } catch (e) {
        console.warn('auth load failed', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function signIn({ token: t, user: u }: { token: string; user?: User }) {
    setToken(t);
    shipperApi.setToken(t);
    setUser(u || null);
  await safeSetItem(TOKEN_KEY, t);
  if (u) await safeSetItem(USER_KEY, JSON.stringify(u));
  }

  async function signOut() {
    setToken(null);
    shipperApi.setToken(null);
    setUser(null);
  await safeDeleteItem(TOKEN_KEY);
  await safeDeleteItem(USER_KEY);
  }

  return (
    <AuthContext.Provider value={{ token, user, loading, signIn, signOut }}>{children}</AuthContext.Provider>
  );
};

export function useAuth() {
  return useContext(AuthContext);
}
