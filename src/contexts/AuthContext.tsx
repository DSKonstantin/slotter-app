import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useLazyGetMeQuery } from "@/src/store/redux/services/api/authApi";
import { accessTokenStorage } from "@/src/utils/tokenStorage/accessTokenStorage";
import { useSelector } from "react-redux";
import { RootState } from "@/src/store/redux/store";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const user = useSelector((state: RootState) => state.auth.user);
  const [getMe] = useLazyGetMeQuery();
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await accessTokenStorage.get();
        if (token && !user) {
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
      isAuthenticated: !!user,
      isLoading: isInitialLoading,
    }),
    [user, isInitialLoading],
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
