import AxiosClient from "axios";
import Constants from "expo-constants";
import { Platform } from "react-native";

const API_BASE_URL: string = process.env.EXPO_PUBLIC_API_BASE_URL!;

const axios = AxiosClient.create({
  baseURL: API_BASE_URL,
});

axios.interceptors.request.use((config) => {
  config.headers["X-App-Version"] =
    Constants.nativeAppVersion ?? Constants.expoConfig?.version ?? "dev";
  config.headers["X-Platform"] = Platform.OS;
  return config;
});

export default axios;
