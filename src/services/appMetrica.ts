import AppMetrica, {
  Attributes,
  UserProfile,
} from "@appmetrica/react-native-analytics";
import AsyncStorage from "@react-native-async-storage/async-storage";
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

export type ProfileAttribute =
  | { type: "string"; key: string; value: string | null }
  | { type: "number"; key: string; value: number | null }
  | { type: "boolean"; key: string; value: boolean | null };

const wasAppLaunchedBefore = async () => {
  try {
    return (await AsyncStorage.getAllKeys()).length > 0;
  } catch {
    return false;
  }
};

const activation = ENABLED
  ? wasAppLaunchedBefore().then((launchedBefore) =>
      AppMetrica.activate({
        apiKey: API_KEY,
        sessionTimeout: 120,
        logs: false,
        crashReporting: false,
        nativeCrashReporting: false,
        activationAsSessionStart: true,
        firstActivationAsUpdate: launchedBefore,
        ...resolveBuildInfo(
          Application.nativeApplicationVersion,
          Application.nativeBuildVersion,
        ),
      }),
    )
  : null;

export function reportEvent(name: string, params?: Record<string, unknown>) {
  activation?.then(() => AppMetrica.reportEvent(name, params));
}

export function setUserProfileId(userId: number | null) {
  activation?.then(() =>
    AppMetrica.setUserProfileID(userId !== null ? String(userId) : undefined),
  );
}

const toProfileUpdate = (attribute: ProfileAttribute) => {
  switch (attribute.type) {
    case "string": {
      const target = Attributes.customString(attribute.key);
      return attribute.value === null
        ? target.withValueReset()
        : target.withValue(attribute.value);
    }
    case "number": {
      const target = Attributes.customNumber(attribute.key);
      return attribute.value === null
        ? target.withValueReset()
        : target.withValue(attribute.value);
    }
    case "boolean": {
      const target = Attributes.customBoolean(attribute.key);
      return attribute.value === null
        ? target.withValueReset()
        : target.withValue(attribute.value);
    }
  }
};

export function setProfileAttributes(attributes: ProfileAttribute[]) {
  if (attributes.length === 0) return;
  activation?.then(() => {
    const profile = attributes.reduce(
      (current, attribute) => current.apply(toProfileUpdate(attribute)),
      new UserProfile(),
    );
    AppMetrica.reportUserProfile(profile);
  });
}
