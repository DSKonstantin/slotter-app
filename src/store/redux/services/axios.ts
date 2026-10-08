import AxiosClient from "axios";
import { Platform } from "react-native";
import { getAppVersion } from "@/src/utils/appVersion";

const API_BASE_URL: string = process.env.EXPO_PUBLIC_API_BASE_URL!;

const axios = AxiosClient.create({
  baseURL: API_BASE_URL,
});

axios.interceptors.request.use((config) => {
  config.headers["X-App-Version"] = getAppVersion();
  config.headers["X-Platform"] = Platform.OS;
  return config;
});

export default axios;
