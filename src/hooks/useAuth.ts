import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/src/store/redux/store";
import { useLazyGetMeQuery } from "@/src/store/redux/services/api/authApi";
import { accessTokenStorage } from "@/src/utils/tokenStorage/accessTokenStorage";

export const useAuth = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const [getMe, { isLoading: isUserFetching }] = useLazyGetMeQuery();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await accessTokenStorage.get();
        if (token) {
          // If we have a token, we might already have the user in Redux state.
          // If not, we can fetch it.
          if (!user) {
            await getMe();
          }
        }
      } catch (e) {
        console.error("Auth check failed", e);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [user, getMe]);

  // The overall loading state is true if we are performing the initial check
  // or if we are actively fetching the user.
  const finalIsLoading = isLoading || isUserFetching;

  return { user, isLoading: finalIsLoading };
};
