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
import {
  requestNotificationPermission,
  getFcmToken,
  deleteFcmToken,
} from '../services/notifications';
import {
  registerDeviceToken,
  unregisterDeviceToken,
} from '../services/notificationsApi';

const STORAGE_KEY = '@travelhub:user';
const FCM_TOKEN_KEY = '@travelhub:fcmToken';

const registerPushAfterAuth = async (
  jwt: string | undefined,
): Promise<void> => {
  if (!jwt) {
    return;
  }
  try {
    const granted = await requestNotificationPermission();
    if (!granted) {
      return;
    }
    const fcmToken = await getFcmToken();
    if (!fcmToken) {
      return;
    }
    await AsyncStorage.setItem(FCM_TOKEN_KEY, fcmToken);
    await registerDeviceToken({fcmToken, token: jwt});
  } catch {
    // No bloqueamos el login por errores de push
  }
};

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
        await registerPushAfterAuth(loggedUser.token);
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
      await registerPushAfterAuth(loggedUser.token);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      const fcmToken = await AsyncStorage.getItem(FCM_TOKEN_KEY);
      if (fcmToken && user?.token) {
        await unregisterDeviceToken({fcmToken, token: user.token});
      }
      await deleteFcmToken();
      await AsyncStorage.removeItem(FCM_TOKEN_KEY);
    } catch {
      // El logout local debe completarse aunque falle el cleanup de push
    }
    await AsyncStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }, [user]);

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
