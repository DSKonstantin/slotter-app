export const asArray = <T>(value: T[] | null | undefined): T[] =>
  Array.isArray(value) ? value : [];
