import { useCallback } from "react";
import { Alert, Linking } from "react-native";
import { useAppSelector } from "@/src/store/redux/store";

export function useOpenPersonalAccount() {
  const userId = useAppSelector((s) => s.auth.user?.id);
  const token = useAppSelector((s) => s.auth.token);

  return useCallback(
    (path: string = "") =>
      Linking.openURL(
        `${process.env.EXPO_PUBLIC_BOOKING_BASE_URL}/personal-account/${userId}${path}?token=${token}`,
      ).catch(() => {
        Alert.alert("Не удалось открыть ссылку", "Попробуйте ещё раз");
      }),
    [userId, token],
  );
}
