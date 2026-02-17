import React, { useEffect, useState } from "react";

import { accessTokenStorage } from "@/src/utils/tokenStorage/accessTokenStorage";
import { useLazyGetMeQuery } from "@/src/store/redux/services/api/authApi";

type Props = {
  children: React.ReactNode;
  onReady: () => void;
};

export const AuthProvider = ({ children, onReady }: Props) => {
  const [triggerGetMe] = useLazyGetMeQuery();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const token = await accessTokenStorage.get();

        if (token) {
          await triggerGetMe();
        }
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
