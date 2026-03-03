import type { BaseQueryApi, BaseQueryFn } from "@reduxjs/toolkit/query";
import type { AxiosRequestConfig } from "axios";
import { AxiosHeaders, isAxiosError } from "axios";
import axios from "./axios";

export interface AxiosBaseQueryError {
  status: number | "FETCH_ERROR" | "CUSTOM_ERROR";
  data: unknown;
}

export interface AxiosBaseQueryArgs {
  prepareHeaders?: (headers: AxiosHeaders, api: BaseQueryApi) => AxiosHeaders;
}

const DEFAULT_ERROR_MESSAGE = { error: "Что-то пошло не так" };
const METHOD_HEADER_KEYS = new Set([
  "common",
  "delete",
  "get",
  "head",
  "options",
  "post",
  "put",
  "patch",
]);

const getRequestConfig = (
  args: string | AxiosRequestConfig,
): AxiosRequestConfig => {
  if (typeof args === "string") {
    return { url: args };
  }

  return args;
};

const getErrorPayload = (error: unknown): AxiosBaseQueryError => {
  if (!isAxiosError(error)) {
    return {
      status: "CUSTOM_ERROR",
      data:
        error instanceof Error
          ? error.message
          : (error ?? DEFAULT_ERROR_MESSAGE),
    };
  }

  if (!error.response) {
    return {
      status: "FETCH_ERROR",
      data: error.message || DEFAULT_ERROR_MESSAGE,
    };
  }

  return {
    status: error.response.status,
    data: error.response.data || error.message || DEFAULT_ERROR_MESSAGE,
  };
};

const normalizeRequestHeaders = (
  requestHeaders: AxiosRequestConfig["headers"],
): AxiosHeaders => {
  if (!requestHeaders) {
    return new AxiosHeaders();
  }

  if (requestHeaders instanceof AxiosHeaders) {
    return AxiosHeaders.from(requestHeaders);
  }

  const headers = new AxiosHeaders();

  for (const [key, value] of Object.entries(
    requestHeaders as Record<string, unknown>,
  )) {
    if (value == null) continue;

    if (METHOD_HEADER_KEYS.has(key)) {
      headers.set(value as any);
      continue;
    }

    headers.set(key, value as any);
  }

  return headers;
};

const axiosBaseQuery = ({
  prepareHeaders,
}: AxiosBaseQueryArgs = {}): BaseQueryFn<
  AxiosRequestConfig | string,
  unknown,
  AxiosBaseQueryError
> => {
  return async (args, api) => {
    try {
      const requestConfig = getRequestConfig(args);
      const headers = normalizeRequestHeaders(requestConfig.headers);
      const preparedHeaders = prepareHeaders?.(headers, api) ?? headers;

      const result = await axios({
        ...requestConfig,
        headers: preparedHeaders,
        signal: api.signal,
      });

      return {
        data: result.data,
      };
    } catch (error) {
      return {
        error: getErrorPayload(error),
      };
    }
  };
};

export default axiosBaseQuery;
