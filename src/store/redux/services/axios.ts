import AxiosClient from "axios";

const API_BASE_URL: string =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? "https://staging.slotter.app/api/v1/";

const axios = AxiosClient.create({
  baseURL: API_BASE_URL,
});

export default axios;
