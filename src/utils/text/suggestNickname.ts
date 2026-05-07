import { transliterate } from "./transliterate";

const sanitize = (val: string) =>
  transliterate(val.trim()).replace(/[^a-z0-9._]/g, "");

export function suggestNicknames(
  name?: string | null,
  surname?: string | null,
  profession?: string | null,
): string[] {
  const n = sanitize(name ?? "");
  const s = sanitize(surname ?? "");
  const p = sanitize(profession ?? "");

  const candidates = [
    n && s ? `${n}.${s}` : "",
    n && s ? `${s}.${n}` : "",
    n && p ? `${p}.${n}` : "",
    n && s ? `${n}_${s}` : "",
    n || "",
    p || "",
  ];

  return [...new Set(candidates.filter(Boolean))];
}
