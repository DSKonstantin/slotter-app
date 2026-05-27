import capitalize from "lodash/capitalize";

type ApiErrorData = {
  error?: string | string[];
  errors?: Record<string, string[]> | string[];
};

type ApiError = {
  data: ApiErrorData;
};

// Messages from the backend that unambiguously mean "your token is dead".
// Any other 401 (e.g. wrong current_password in credentials update) is a
// business-logic error — the session is still valid, do NOT log the user out.
const TOKEN_DEAD_MESSAGES = new Set([
  "Авторизуйтесь для продолжения", // authenticate_resource! — token missing / invalidated
  "Срок действия токена истек", // sessions#show — JWT::ExpiredSignature
  "Недействительный токен", // sessions#show — JWT::DecodeError
  "Токен отозван", // sessions#show — jti in JwtDenylist
  "Пользователь не найден", // sessions#show — user deleted from DB
  "Токен не предоставлен", // sessions#show — blank Authorization header
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

  // No parseable message → be conservative and treat as auth error
  if (!message) return true;

  return TOKEN_DEAD_MESSAGES.has(message);
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
