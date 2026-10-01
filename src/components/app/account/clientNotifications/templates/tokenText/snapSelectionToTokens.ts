import { STRICT_TOKEN_RE } from "./tokenPattern";
import type { TextSelection } from "./insertToken";

const findTokenAround = (text: string, index: number) => {
  for (const match of text.matchAll(STRICT_TOKEN_RE)) {
    const start = match.index;
    const end = start + match[0].length;
    if (index > start && index < end) return { start, end };
  }
  return null;
};

const nearestBoundary = (
  index: number,
  token: { start: number; end: number },
) => (index - token.start <= token.end - index ? token.start : token.end);

export function snapSelectionToTokens(
  text: string,
  selection: TextSelection,
): TextSelection {
  if (selection.start === selection.end) {
    const token = findTokenAround(text, selection.start);
    if (!token) return selection;
    const caret = nearestBoundary(selection.start, token);
    return { start: caret, end: caret };
  }

  const startToken = findTokenAround(text, selection.start);
  const endToken = findTokenAround(text, selection.end);
  return {
    start: startToken ? startToken.start : selection.start,
    end: endToken ? endToken.end : selection.end,
  };
}

export function moveInsertionOutOfToken(
  oldText: string,
  newText: string,
): { text: string; selection: TextSelection } | null {
  const inserted = newText.length - oldText.length;
  if (inserted <= 0) return null;

  let i = 0;
  while (i < oldText.length && oldText[i] === newText[i]) i++;
  if (oldText.slice(i) !== newText.slice(i + inserted)) return null;

  const token = findTokenAround(oldText, i);
  if (!token) return null;

  const boundary = nearestBoundary(i, token);
  const chunk = newText.slice(i, i + inserted);
  const caret = boundary + chunk.length;
  return {
    text: oldText.slice(0, boundary) + chunk + oldText.slice(boundary),
    selection: { start: caret, end: caret },
  };
}
