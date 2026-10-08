import AppMetrica from "@appmetrica/react-native-analytics";
import * as Application from "expo-application";

const API_KEY = process.env.EXPO_PUBLIC_APPMETRICA_API_KEY;
const ENABLED = !!API_KEY && !__DEV__;

export const resolveBuildInfo = (
  version: string | null,
  build: string | null,
) => {
  const buildNumber = Number(build);
  return {
    appVersion: version || undefined,
    appBuildNumber:
      Number.isInteger(buildNumber) && buildNumber > 0
        ? buildNumber
        : undefined,
  };
};

if (ENABLED) {
  AppMetrica.activate({
    apiKey: API_KEY,
    sessionTimeout: 120,
    logs: false,
    ...resolveBuildInfo(
      Application.nativeApplicationVersion,
      Application.nativeBuildVersion,
    ),
  });
}

export function reportEvent(name: string, params?: Record<string, unknown>) {
  if (!ENABLED) return;
  AppMetrica.reportEvent(name, params);
}

export function setUserProfileId(userId: number | null) {
  if (!ENABLED) return;
  AppMetrica.setUserProfileID(userId !== null ? String(userId) : undefined);
}
