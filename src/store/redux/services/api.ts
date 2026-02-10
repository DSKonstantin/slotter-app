import { createApi } from "@reduxjs/toolkit/query/react";
import { API } from "./api-types";
import axiosBaseQuery from "./axiosBaseQuery";

export const api = createApi({
  reducerPath: "api",
  baseQuery: axiosBaseQuery({
    transformResponse: (response) => response,
  }),
  endpoints: (builder) => ({
    get: builder.query<API.TestResponse, void>({
      query: () => "/jokes/random",
    }),

    test: builder.query<API.TestResponse, void>({
      query: () => "/jokes/random",
    }),
  }),
});

export const { useGetQuery } = api;
