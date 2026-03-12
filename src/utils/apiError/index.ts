type ApiError = {
  data: {
    error?: string | string[];
    errors?: Record<string, string[]>;
  };
};

const isApiError = (e: unknown): e is ApiError =>
  typeof e === "object" && e !== null && "data" in e;

export const getApiErrorMessage = (e: unknown, fallback: string): string => {
  if (!isApiError(e)) return fallback;
  const { error, errors } = e.data;

  if (errors) {
    const messages = Object.values(errors).flat();
    return messages.length > 0 ? messages.join(", ") : fallback;
  }

  if (error) {
    return Array.isArray(error) ? error.join(", ") : error;
  }

  return fallback;
};
