import * as Application from "expo-application";
import Constants from "expo-constants";

export const getAppVersion = () =>
  Application.nativeApplicationVersion ??
  Constants.expoConfig?.version ??
  "dev";
