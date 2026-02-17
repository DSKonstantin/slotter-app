import Axios from "axios";
import { accessTokenStorage } from "@/src/utils/tokenStorage/accessTokenStorage";

const API_BASE_URL: string = "https://staging.slotter.app/api/v1/";

const axios = Axios.create({
  baseURL: API_BASE_URL,
});

axios.interceptors.request.use(
  async (config) => {
    try {
      const token = await accessTokenStorage.get();

      if (token && config.headers) {
        config.headers.set("Authorization", `Bearer ${token}`);
      }
    } catch (e) {
      console.log("TOKEN READ ERROR:", e);
    }

    return config;
  },
  (error) => Promise.reject(error),
);

export default axios;
