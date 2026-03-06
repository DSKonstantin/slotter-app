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

// React Native's FormData polyfill stores parts in _parts array.
// instanceof FormData is unreliable on Android because Axios may bundle its own
// FormData reference that differs from RN's polyfill class.
const isFormData = (data: unknown): data is FormData =>
  data instanceof FormData || Array.isArray((data as any)?._parts);

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

// For FormData requests, Axios on Android is unreliable — it may JSON.stringify
// the body or set the wrong Content-Type. React Native's native fetch() handles
// FormData correctly on both iOS and Android, so we bypass Axios entirely.
const fetchMultipart = async (
  requestConfig: AxiosRequestConfig,
  preparedHeaders: AxiosHeaders,
): Promise<{ data: unknown } | { error: AxiosBaseQueryError }> => {
  const baseURL = axios.defaults.baseURL ?? "";
  const url = requestConfig.url?.startsWith("http")
    ? requestConfig.url
    : `${baseURL}${requestConfig.url ?? ""}`;

  // Copy prepared headers, excluding Content-Type so the native layer can set
  // it with the correct multipart boundary.
  const fetchHeaders: Record<string, string> = {};
  preparedHeaders.forEach((value, key) => {
    if (key.toLowerCase() !== "content-type") {
      fetchHeaders[key] = value;
    }
  });

  try {
    const response = await fetch(url, {
      method: (requestConfig.method ?? "POST").toUpperCase(),
      headers: fetchHeaders,
      body: requestConfig.data as FormData,
    });

    const text = await response.text();
    const json = text ? JSON.parse(text) : null;

    if (!response.ok) {
      return {
        error: {
          status: response.status,
          data: json ?? DEFAULT_ERROR_MESSAGE,
        },
      };
    }

    return { data: json };
  } catch (error) {
    return {
      error: {
        status: "FETCH_ERROR",
        data: error instanceof Error ? error.message : DEFAULT_ERROR_MESSAGE,
      },
    };
  }
};

const axiosBaseQuery = ({
  prepareHeaders,
}: AxiosBaseQueryArgs = {}): BaseQueryFn<
  AxiosRequestConfig | string,
  unknown,
  AxiosBaseQueryError
> => {
  return async (args, api) => {
    const requestConfig = getRequestConfig(args);
    const headers = normalizeRequestHeaders(requestConfig.headers);
    const preparedHeaders = prepareHeaders?.(headers, api) ?? headers;

    if (isFormData(requestConfig.data)) {
      return fetchMultipart(requestConfig, preparedHeaders);
    }

    try {
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
