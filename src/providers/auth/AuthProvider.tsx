import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

import { accessTokenStorage } from "@/src/utils/tokenStorage/accessTokenStorage";
import { useLazyGetMeQuery } from "@/src/store/redux/services/authApi";
import {
  setUser,
  logout,
  setLoading,
} from "@/src/store/redux/slices/authSlice";

type Props = {
  children: React.ReactNode;
  onReady: () => void;
};

export const AuthProvider = ({ children, onReady }: Props) => {
  const dispatch = useDispatch();
  const [triggerGetMe] = useLazyGetMeQuery();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        dispatch(setLoading());
        const token = await accessTokenStorage.get();

        if (!token) {
          dispatch(logout());
        } else {
          const result = await triggerGetMe().unwrap();
          dispatch(setUser(result.resource));
        }
      } catch {
        await accessTokenStorage.remove();
        dispatch(logout());
      } finally {
        setInitialized(true);
        onReady();
      }
    };

    bootstrap();
  }, []);

  if (!initialized) return null;

  return <>{children}</>;
};
