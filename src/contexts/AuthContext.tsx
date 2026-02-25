import {
  createContext,
  useCallback,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useLazyGetMeQuery } from "@/src/store/redux/services/api/authApi";
import { accessTokenStorage } from "@/src/utils/tokenStorage/accessTokenStorage";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/src/store/redux/store";
import {
  logout as logoutAction,
  setToken,
} from "@/src/store/redux/slices/authSlice";

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
  const user = useSelector((state: RootState) => state.auth.user);
  const [getMe] = useLazyGetMeQuery();
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const login = useCallback(
    async (token: string) => {
      try {
        await accessTokenStorage.set(token);
        dispatch(setToken(token));
      } catch {
        await accessTokenStorage.remove();
        dispatch(logoutAction());
      }
    },
    [dispatch],
  );

  const logout = useCallback(async () => {
    try {
      await accessTokenStorage.remove();
    } finally {
      dispatch(logoutAction());
    }
  }, [dispatch]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await accessTokenStorage.get();

        if (token) {
          dispatch(setToken(token));
          await getMe().unwrap();
        }
      } catch (e) {
        console.error("Auth check failed", e);
        await accessTokenStorage.remove();
        dispatch(setToken(null));
      } finally {
        setIsInitialLoading(false);
      }
    };

    checkAuth();
    // Run auth bootstrap only once on app start.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getMe]);

  const value = useMemo(
    () => ({
      isAuthenticated: !!user,
      isOnboardingComplete: Boolean(user?.email && user?.profession),
      isLoading: isInitialLoading,
      login,
      logout,
    }),
    [user, isInitialLoading, login, logout],
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
