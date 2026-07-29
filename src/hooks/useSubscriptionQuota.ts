import { skipToken } from "@reduxjs/toolkit/query";

import { useGetSubscriptionQuotaQuery } from "@/src/store/redux/services/api/subscriptionApi";
import { useAppSelector } from "@/src/store/redux/store";

export function useSubscriptionQuota() {
  const userId = useAppSelector((s) => s.auth.user?.id);
  const membership = useAppSelector(
    (s) => s.auth.user?.subscription_membership,
  );

  const shouldFetchQuota = membership !== undefined && !membership.pro_access;

  const { data: quota, refetch } = useGetSubscriptionQuotaQuery(
    userId != null && shouldFetchQuota ? { userId } : skipToken,
  );

  return { quota, membership, shouldFetchQuota, refetch };
}
