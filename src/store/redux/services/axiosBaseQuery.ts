import type { BaseQueryApi, BaseQueryFn } from "@reduxjs/toolkit/query";
import type { AxiosRequestConfig } from "axios";
import { AxiosHeaders, isAxiosError } from "axios";
import axios from "./axios";
import type { BaseResponse } from "./api-types";

export interface AxiosBaseQueryError {
  status: number | "FETCH_ERROR" | "CUSTOM_ERROR";
  data: unknown;
}

export interface AxiosBaseQueryArgs<
  Meta,
  Response = BaseResponse,
  Result = Response,
  DefinitionExtraOptions extends ServiceExtraOptions = ServiceExtraOptions,
> {
  meta?: Meta;
  prepareHeaders?: (
    headers: AxiosHeaders,
    api: BaseQueryApi,
    extraOptions: DefinitionExtraOptions,
  ) => AxiosHeaders;
  transformResponse?: (response: Response, api: BaseQueryApi) => Result;
}

export interface ServiceExtraOptions {
  authRequired?: boolean;
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
  "purge",
  "link",
  "unlink",
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

  for (const [key, value] of Object.entries(requestHeaders)) {
    if (value === undefined) {
      continue;
    }

    if (METHOD_HEADER_KEYS.has(key)) {
      if (value instanceof AxiosHeaders) {
        headers.set(value);
      }
      continue;
    }

    headers.set(key, value);
  }

  return headers;
};

const axiosBaseQuery = <
  Args extends AxiosRequestConfig | string = AxiosRequestConfig,
  Response = BaseResponse,
  Result = Response,
  DefinitionExtraOptions extends ServiceExtraOptions = ServiceExtraOptions,
  Meta = Record<string, unknown>,
>({
  prepareHeaders,
  meta,
  transformResponse,
}: AxiosBaseQueryArgs<
  Meta,
  Response,
  Result,
  DefinitionExtraOptions
> = {}): BaseQueryFn<
  Args,
  Result,
  AxiosBaseQueryError,
  DefinitionExtraOptions,
  Meta
> => {
  return async (args, api, extraOptions) => {
    const resolvedExtraOptions = (extraOptions ?? {}) as DefinitionExtraOptions;
    const { authRequired: _authRequired, ...axiosOverrides } =
      resolvedExtraOptions as DefinitionExtraOptions & AxiosRequestConfig;

    try {
      const requestConfig = getRequestConfig(args);
      const headers = normalizeRequestHeaders(requestConfig.headers);
      const preparedHeaders =
        prepareHeaders?.(headers, api, resolvedExtraOptions) ?? headers;

      const result = await axios({
        ...requestConfig,
        ...(axiosOverrides as AxiosRequestConfig),
        headers: preparedHeaders,
        signal: api.signal,
      });

      return {
        data: transformResponse
          ? transformResponse(result.data as Response, api)
          : (result.data as Result),
        meta,
      };
    } catch (error) {
      return {
        error: getErrorPayload(error),
        meta,
      };
    }
  };
};

export default axiosBaseQuery;
