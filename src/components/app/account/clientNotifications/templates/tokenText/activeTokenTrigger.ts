export type ActiveTokenTrigger = { start: number; query: string };

export function getActiveTokenTrigger(
  text: string,
  cursor: number,
): ActiveTokenTrigger | null {
  const uptoCursor = text.slice(0, cursor);
  const start = uptoCursor.lastIndexOf("{{");
  if (start === -1) return null;

  const query = uptoCursor.slice(start + 2);
  if (query.includes("}}") || !/^\w*$/.test(query)) return null;

  return { start, query };
}
