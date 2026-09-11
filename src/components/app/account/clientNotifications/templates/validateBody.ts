import { ANY_TOKEN_RE } from "./tokenPattern";

const BODY_LIMIT = 1000;

export function validateBody(
  body: string,
  allowedKeys: string[],
): string | null {
  if (!body.trim()) return "Текст не может быть пустым";
  if (body.length > BODY_LIMIT) return `Не длиннее ${BODY_LIMIT} символов`;

  if (body.replace(ANY_TOKEN_RE, "").match(/\{\{|}}/)) {
    return "Незакрытая скобка в переменной";
  }

  const unknown = [...body.matchAll(ANY_TOKEN_RE)]
    .map((match) => match[1])
    .filter((key) => !allowedKeys.includes(key));
  if (unknown.length) return `Неизвестные переменные: ${unknown.join(", ")}`;

  return null;
}
