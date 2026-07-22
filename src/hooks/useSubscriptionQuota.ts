import { skipToken } from "@reduxjs/toolkit/query";

import { useGetSubscriptionQuotaQuery } from "@/src/store/redux/services/api/subscriptionApi";
import { useAppSelector } from "@/src/store/redux/store";

// Единая точка для квоты записей: запрос уходит только когда PRO-статус
// известен и юзер не PRO. membership === undefined — статус ещё не загружен
// (login-ответ его не несёт, он приходит только из getMe) — в этом состоянии
// квоту не запрашиваем, чтобы PRO-юзеру не мигал баннер лимита.
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
