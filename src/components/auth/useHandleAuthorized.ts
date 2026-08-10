import { useCallback } from "react";
import { router } from "expo-router";

import type { User } from "@/src/store/redux/services/api-types";
import { useAuth } from "@/src/contexts/AuthContext";
import { useLazyGetSubscriptionMembershipQuery } from "@/src/store/redux/services/api/subscriptionApi";
import getRedirectPath from "@/src/utils/getOnboardingStep";

export const useHandleAuthorized = () => {
  const { login } = useAuth();
  const [getSubscriptionMembership] = useLazyGetSubscriptionMembershipQuery();

  return useCallback(
    async (token: string, resource: User) => {
      await login(token);
      getSubscriptionMembership({ userId: resource.id }).catch(() => {});
      router.replace(getRedirectPath(resource));
    },
    [login, getSubscriptionMembership],
  );
};
