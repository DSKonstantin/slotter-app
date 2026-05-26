import { transliterate } from "./transliterate";

const sanitize = (val: string) =>
  transliterate(val.trim()).replace(/[^a-z0-9_]/g, "");

export function suggestNicknames(
  name?: string | null,
  surname?: string | null,
  profession?: string | null,
): string[] {
  const n = sanitize(name ?? "");
  const s = sanitize(surname ?? "");
  const p = sanitize(profession ?? "");

  const candidates = [
    n && s ? `${n}_${s}` : "",
    n && s ? `${s}_${n}` : "",
    n && p ? `${p}_${n}` : "",
    n || "",
    p || "",
  ];

  return [...new Set(candidates.filter(Boolean))];
}
