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
import { useDispatch } from "react-redux";
import { useAppSelector } from "@/src/store/redux/store";
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
  const user = useAppSelector((s) => s.auth.user);
  const token = useAppSelector((s) => s.auth.token);
  const [getMe] = useLazyGetMeQuery();
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const login = useCallback(
    async (token: string) => {
      try {
        await accessTokenStorage.set('eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIyNCIsInNjcCI6InVzZXIiLCJhdWQiOm51bGwsImlhdCI6MTc3NjY5Njk1MSwiZXhwIjoxNzc4NTExMzUxLCJqdGkiOiJhNDZkMDIyZi0yZjRlLTRiOWQtYmZhZS04NTYxYzFmYzAwNzIifQ.mpaseAFbT3Csf9jRw54NoxWlPIPx58jWbgBMaATwSAo');
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
        await accessTokenStorage.set('eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIyNCIsInNjcCI6InVzZXIiLCJhdWQiOm51bGwsImlhdCI6MTc3NjY5Njk1MSwiZXhwIjoxNzc4NTExMzUxLCJqdGkiOiJhNDZkMDIyZi0yZjRlLTRiOWQtYmZhZS04NTYxYzFmYzAwNzIifQ.mpaseAFbT3Csf9jRw54NoxWlPIPx58jWbgBMaATwSAo');

        if (token) {
          dispatch(setToken(token));
          await getMe().unwrap();
        }
      } catch (e) {
        console.error("Auth check failed", e);
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
      isAuthenticated: Boolean(token && user),
      isOnboardingComplete: user?.onboarding_step === "completed",
      isLoading: isInitialLoading,
      login,
      logout,
    }),
    [token, user, isInitialLoading, login, logout],
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
