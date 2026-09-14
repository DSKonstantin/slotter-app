export type TextSelection = { start: number; end: number };

export type InsertTokenResult = {
  text: string;
  selection: TextSelection;
};

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

export const insertToken = (
  text: string,
  selection: TextSelection,
  token: string,
  maxLength: number,
): InsertTokenResult => {
  const start = clamp(selection.start, 0, text.length);
  const end = clamp(selection.end, start, text.length);

  const next = text.slice(0, start) + token + text.slice(end);
  if (next.length > maxLength) {
    return { text, selection: { start, end } };
  }

  const cursor = start + token.length;
  return { text: next, selection: { start: cursor, end: cursor } };
};
