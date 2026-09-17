import capitalize from "lodash/capitalize";

type ApiErrorData = {
  error?: string | string[];
  errors?: Record<string, string[]> | string[];
};

type ApiError = {
  data: ApiErrorData;
};

const TOKEN_DEAD_MESSAGES = new Set([
  "Авторизуйтесь для продолжения",
  "Срок действия токена истек",
  "Недействительный токен",
  "Токен отозван",
  "Пользователь не найден",
  "Токен не предоставлен",
]);

export const isAuthError = (e: unknown): boolean => {
  if (!e || typeof e !== "object") return false;
  if ((e as { status?: unknown }).status !== 401) return false;

  const data = (e as { data?: unknown }).data;
  const message =
    data &&
    typeof data === "object" &&
    "error" in data &&
    typeof (data as { error?: unknown }).error === "string"
      ? (data as { error: string }).error.trim()
      : null;

  if (!message) return true;

  return TOKEN_DEAD_MESSAGES.has(message);
};

const isApiError = (e: unknown): e is ApiError =>
  typeof e === "object" &&
  e !== null &&
  "data" in e &&
  typeof (e as ApiError).data === "object";

const isValidMessage = (msg: string) =>
  !msg.startsWith("Translation missing") && /[Ѐ-ӿ]/.test(msg);

export const isQuotaExceeded = (e: unknown): boolean => {
  if (!isApiError(e)) return false;
  return (e.data as { error?: unknown }).error === "QUOTA_EXCEEDED";
};

export const isDirectChannelRequired = (e: unknown): boolean => {
  if (!isApiError(e)) return false;
  if ((e as { status?: unknown }).status !== 402) return false;
  return (e.data as { error?: unknown }).error === "DIRECT_CHANNEL_REQUIRED";
};

export const getApiErrorCode = (e: unknown): string | null => {
  if (!isApiError(e)) return null;
  const code = (e.data as { code?: unknown }).code;
  return typeof code === "string" ? code : null;
};

/** Message for one specific field's 422 errors (e.g. "break_after_minutes"),
 * for showing under that field instead of/alongside a generic toast.
 * Returns undefined when the response carries no error for that field. */
export const getApiFieldError = (
  e: unknown,
  field: string,
): string | undefined => {
  if (!isApiError(e)) return undefined;
  const { errors } = e.data;
  if (!errors || Array.isArray(errors)) return undefined;

  const messages = errors[field]?.filter(isValidMessage);
  return messages && messages.length > 0
    ? capitalize(messages.join(", "))
    : undefined;
};

const BREAK_AFTER_INTERSECTION_HINT =
  "Уменьшите перерыв, чтобы он заканчивался до начала следующей записи, выберите «Без перерыва» (0) или другое время записи";

/** Extra hint for break_after_minutes when the 422 is specifically an
 * overlap with another appointment (§8.2/§9.3.4) — undefined for any
 * other break_after_minutes error. */
export const getBreakAfterIntersectionHint = (
  e: unknown,
): string | undefined => {
  if (!isApiError(e)) return undefined;
  const { errors } = e.data;
  if (!errors || Array.isArray(errors)) return undefined;

  const intersects = errors.break_after_minutes?.some((m) =>
    m.includes("пересека"),
  );
  return intersects ? BREAK_AFTER_INTERSECTION_HINT : undefined;
};

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
