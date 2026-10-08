import { useEffect } from "react";
import { setUserProfileId } from "@/src/services/appMetrica";
import { useAppSelector } from "@/src/store/redux/store";

export function useAppMetricaUserSync() {
  const userId = useAppSelector((s) => s.auth.user?.id ?? null);

  useEffect(() => {
    setUserProfileId(userId);
  }, [userId]);
}
