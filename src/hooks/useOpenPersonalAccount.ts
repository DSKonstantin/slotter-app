import { useCallback } from "react";
import { router } from "expo-router";
import { useAppSelector } from "@/src/store/redux/store";
import { Routers } from "@/src/constants/routers";

export function useOpenPersonalAccount() {
  const userId = useAppSelector((s) => s.auth.user?.id);
  const token = useAppSelector((s) => s.auth.token);

  return useCallback(
    (path: string = "") =>
      router.push(
        Routers.webview(
          `${process.env.EXPO_PUBLIC_BOOKING_BASE_URL}/personal-account/${userId}${path}?token=${token}`,
        ),
      ),
    [userId, token],
  );
}
