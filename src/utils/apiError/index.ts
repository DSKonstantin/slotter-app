type ApiErrorData = {
  error?: string | string[];
  errors?: Record<string, string[]> | string[];
};

type ApiError = {
  data: ApiErrorData;
};

const isApiError = (e: unknown): e is ApiError =>
  typeof e === "object" &&
  e !== null &&
  "data" in e &&
  typeof (e as ApiError).data === "object";

export const getApiErrorMessage = (e: unknown, fallback: string): string => {
  if (!isApiError(e)) return fallback;
  const { error, errors } = e.data;

  if (errors) {
    if (Array.isArray(errors)) {
      return errors.length > 0 ? errors.join(", ") : fallback;
    }
    const messages = Object.entries(errors).flatMap(([, msgs]) => msgs);
    return messages.length > 0 ? messages.join(", ") : fallback;
  }

  if (error) {
    return Array.isArray(error) ? error.join(", ") : error;
  }

  return fallback;
};
