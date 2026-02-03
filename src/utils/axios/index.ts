import axios from "axios";
// import { accessTokenMemory } from "@/src/auth/accessToken";

export const axiosInstance = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
});

axiosInstance.interceptors.request.use((config) => {
  // const token = accessTokenMemory.get();

  // if (token) {
  //   config.headers.Authorization = `Bearer ${token}`;
  // }

  return config;
});
