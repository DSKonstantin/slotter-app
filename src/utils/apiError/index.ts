type ApiError = { data: { error: string | string[] } };

const isApiError = (e: unknown): e is ApiError =>
  typeof e === "object" && e !== null && "data" in e;

export const getApiErrorMessage = (e: unknown, fallback: string): string => {
  if (!isApiError(e)) return fallback;
  const { error } = e.data;
  return Array.isArray(error) ? error.join(", ") : error;
};
