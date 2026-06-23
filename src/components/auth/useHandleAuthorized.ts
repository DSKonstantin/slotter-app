import { useCallback } from "react";
import { router } from "expo-router";

import type { User } from "@/src/store/redux/services/api-types";
import { useAuth } from "@/src/contexts/AuthContext";
import getRedirectPath from "@/src/utils/getOnboardingStep";

export const useHandleAuthorized = () => {
  const { login } = useAuth();
  return useCallback(
    async (token: string, resource: User) => {
      await login(token);
      router.replace(getRedirectPath(resource));
    },
    [login],
  );
};
