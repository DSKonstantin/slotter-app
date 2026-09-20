import { STRICT_TOKEN_RE } from "./tokenPattern";
import type { TextSelection } from "./insertToken";

export function collapseTokenOnDelete(
  oldText: string,
  newText: string,
): { text: string; selection: TextSelection } | null {
  if (newText.length !== oldText.length - 1) return null;

  let i = 0;
  while (i < newText.length && oldText[i] === newText[i]) i++;
  const removedIndex = i;

  STRICT_TOKEN_RE.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = STRICT_TOKEN_RE.exec(oldText))) {
    const start = match.index;
    const end = start + match[0].length;
    if (removedIndex >= start && removedIndex < end) {
      return {
        text: oldText.slice(0, start) + oldText.slice(end),
        selection: { start, end: start },
      };
    }
  }
  return null;
}
