import { createApi } from "@reduxjs/toolkit/query/react";
import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosBaseQuery from "./axiosBaseQuery";
import type { RootState } from "@/src/store/redux/store";
import { accessTokenStorage } from "@/src/utils/tokenStorage/accessTokenStorage";

export const setJwtTokenThunk = createAsyncThunk(
  "api/setJwtToken",
  async (token: string) => {
    await accessTokenStorage.set(token);
    return token;
  },
);

export const clearJwtTokenThunk = createAsyncThunk(
  "api/clearJwtToken",
  async () => {
    await accessTokenStorage.remove();
    return null;
  },
);

export const restoreJwtTokenThunk = createAsyncThunk(
  "api/restoreJwtToken",
  async () => {
    const token = await accessTokenStorage.get();
    return token ?? null;
  },
);

export const api = createApi({
  reducerPath: "api",
  baseQuery: axiosBaseQuery({
    transformResponse: (response) => response,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;

      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      return headers;
    },
  }),
  tagTypes: ["ServiceCategories", "Services"],
  endpoints: () => ({}),
});
