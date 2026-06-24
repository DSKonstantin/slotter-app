import {
  createContext,
  useCallback,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  useLazyGetMeQuery,
  useLogoutSessionMutation,
} from "@/src/store/redux/services/api/authApi";
import { shallowEqual, useDispatch } from "react-redux";
import { persistor, useAppSelector } from "@/src/store/redux/store";
import {
  logout as logoutAction,
  setToken,
} from "@/src/store/redux/slices/authSlice";
import { accessTokenStorage } from "@/src/utils/tokenStorage/accessTokenStorage";
import { isAuthError } from "@/src/utils/apiError";

interface AuthContextType {
  isAuthenticated: boolean;
  isOnboardingComplete: boolean;
  isLoading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const dispatch = useDispatch();
  const { isAuthenticated, isOnboardingComplete } = useAppSelector(
    (s) => ({
      isAuthenticated: Boolean(s.auth.token && s.auth.user),
      isOnboardingComplete: s.auth.user?.onboarding_step === "completed",
    }),
    shallowEqual,
  );
  const [getMe] = useLazyGetMeQuery();
  const [logoutSession] = useLogoutSessionMutation();
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const login = useCallback(
    async (newToken: string) => {
      try {
        await accessTokenStorage.set(newToken);
        dispatch(setToken(newToken));
      } catch {
        await accessTokenStorage.remove();
        dispatch(logoutAction());
        await persistor.purge();
      }
    },
    [dispatch],
  );

  const logout = useCallback(async () => {
    try {
      await logoutSession().unwrap();
    } catch {
    } finally {
      await accessTokenStorage.remove();
      dispatch(logoutAction());
      await persistor.purge();
    }
  }, [dispatch, logoutSession]);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const storedToken = await accessTokenStorage.get();
        if (storedToken) {
          dispatch(setToken(storedToken));
          try {
            await getMe().unwrap();
          } catch (e) {
            if (isAuthError(e)) {
              await accessTokenStorage.remove();
              dispatch(logoutAction());
              await persistor.purge();
            }
          }
        } else {
          dispatch(logoutAction());
        }
      } finally {
        setIsInitialLoading(false);
      }
    };

    bootstrap();
    // Run auth bootstrap only once on app start.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo(
    () => ({
      isAuthenticated,
      isOnboardingComplete,
      isLoading: isInitialLoading,
      login,
      logout,
    }),
    [isAuthenticated, isOnboardingComplete, isInitialLoading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
