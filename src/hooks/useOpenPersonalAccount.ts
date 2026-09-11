import { useCallback } from "react";
import { Alert, Linking } from "react-native";
import { useAppSelector } from "@/src/store/redux/store";

export function useOpenPersonalAccount() {
  const userId = useAppSelector((s) => s.auth.user?.id);
  const token = useAppSelector((s) => s.auth.token);

  return useCallback(
    async (path: string = "") => {
      const sep = path.includes("?") ? "&" : "?";
      try {
        await Linking.openURL(
          `${process.env.EXPO_PUBLIC_BOOKING_BASE_URL}/personal-account/${userId}${path}${sep}token=${token}`,
        );
      } catch {
        Alert.alert("Не удалось открыть ссылку", "Попробуйте ещё раз");
      }
    },
    [userId, token],
  );
}
