import { createApi } from "@reduxjs/toolkit/query/react";
import axiosBaseQuery from "./axiosBaseQuery";
import type { RootState } from "@/src/store/redux/store";

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
  tagTypes: [
    "ServiceCategories",
    "Services",
    "AdditionalServices",
    "WorkingDays",
    "WorkingDayBreaks",
  ],
  endpoints: () => ({}),
});
