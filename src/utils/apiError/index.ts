import capitalize from "lodash/capitalize";

type ApiErrorData = {
  error?: string | string[];
  errors?: Record<string, string[]> | string[];
};

type ApiError = {
  data: ApiErrorData;
};

export const isAuthError = (e: unknown): boolean => {
  if (!e || typeof e !== "object") return false;
  const status = (e as { status?: unknown }).status;
  return status === 401 || status === 403;
};

const isApiError = (e: unknown): e is ApiError =>
  typeof e === "object" &&
  e !== null &&
  "data" in e &&
  typeof (e as ApiError).data === "object";

const isValidMessage = (msg: string) => !msg.startsWith("Translation missing");

export const getApiErrorMessage = (e: unknown, fallback: string): string => {
  if (!isApiError(e)) return fallback;
  const { error, errors } = e.data;

  if (errors) {
    if (Array.isArray(errors)) {
      const messages = errors.filter(isValidMessage);
      return messages.length > 0 ? capitalize(messages.join(", ")) : fallback;
    }
    const messages = Object.entries(errors)
      .flatMap(([, msgs]) => msgs)
      .filter(isValidMessage);
    return messages.length > 0 ? capitalize(messages.join(", ")) : fallback;
  }

  if (error) {
    const msg = Array.isArray(error) ? error.join(", ") : error;
    return isValidMessage(msg) ? capitalize(msg) : fallback;
  }

  return fallback;
};
