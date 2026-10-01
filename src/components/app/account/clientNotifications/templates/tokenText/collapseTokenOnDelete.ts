import { STRICT_TOKEN_RE } from "./tokenPattern";
import type { TextSelection } from "./insertToken";

const isBoundary = (char: string | undefined) =>
  char === undefined || char === " " || char === "\n";

export function collapseTokenOnDelete(
  oldText: string,
  newText: string,
): { text: string; selection: TextSelection } | null {
  if (newText.length !== oldText.length - 1) return null;

  let i = 0;
  while (i < newText.length && oldText[i] === newText[i]) i++;
  const removedIndex = i;

  for (const match of oldText.matchAll(STRICT_TOKEN_RE)) {
    const tokenStart = match.index;
    const tokenEnd = tokenStart + match[0].length;
    if (removedIndex < tokenStart || removedIndex >= tokenEnd) continue;

    const start =
      oldText[tokenStart - 1] === " " && isBoundary(oldText[tokenEnd])
        ? tokenStart - 1
        : tokenStart;
    return {
      text: oldText.slice(0, start) + oldText.slice(tokenEnd),
      selection: { start, end: start },
    };
  }
  return null;
}
