import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  login as apiLogin,
  register as apiRegister,
  RegisterParams,
  User,
} from '../services/authApi';

const STORAGE_KEY = '@travelhub:user';

interface AuthContextValue {
  user: User | null;
  initializing: boolean;
  loading: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  register: (params: RegisterParams) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const bootstrap = async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (!cancelled && raw) {
          const parsed = JSON.parse(raw) as User;
          setUser(parsed);
        }
      } catch {
        // Ignore malformed storage
      } finally {
        if (!cancelled) {
          setInitializing(false);
        }
      }
    };
    bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(
    async (identifier: string, password: string) => {
      setLoading(true);
      try {
        const loggedUser = await apiLogin(identifier, password);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(loggedUser));
        setUser(loggedUser);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const register = useCallback(async (params: RegisterParams) => {
    setLoading(true);
    try {
      await apiRegister(params);
      // El endpoint de register no retorna token; autenticamos inmediatamente
      const loggedUser = await apiLogin(params.email, params.password);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(loggedUser));
      setUser(loggedUser);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({user, initializing, loading, login, register, logout}),
    [user, initializing, loading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};
