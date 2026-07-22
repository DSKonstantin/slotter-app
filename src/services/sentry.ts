import { useEffect } from "react";
import * as Sentry from "@sentry/react-native";
import { useAppSelector } from "@/src/store/redux/store";

Sentry.init({
  dsn: "https://9c236a82ab73a2c14d2f3ea01a760271@o4511070792581120.ingest.de.sentry.io/4511501569818704",
  enabled: !__DEV__,
  environment: "production",
  sendDefaultPii: true,
  enableLogs: false,
});

export function useSentryUserSync() {
  const userId = useAppSelector((s) => s.auth.user?.id ?? null);

  useEffect(() => {
    Sentry.setUser(userId !== null ? { id: String(userId) } : null);
  }, [userId]);
}
