import { useCallback } from "react";
import { Linking } from "react-native";
import { useAppSelector } from "@/src/store/redux/store";

// Единственная точка сборки ссылки на веб-кабинет мастера (personal-account):
// база + userId + путь внутри кабинета + ?token= для сквозной авторизации.
// path — путь внутри /personal-account/{userId}, например
// "/notifications/channel-setup/telegram_direct"; без него — корень кабинета.
export function useOpenPersonalAccount() {
  const userId = useAppSelector((s) => s.auth.user?.id);
  const token = useAppSelector((s) => s.auth.token);

  return useCallback(
    (path: string = "") =>
      Linking.openURL(
        `${process.env.EXPO_PUBLIC_BOOKING_BASE_URL}/personal-account/${userId}${path}?token=${token}`,
      ),
    [userId, token],
  );
}
