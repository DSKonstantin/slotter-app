/**
 * Returns an array of Date objects from today (inclusive) through the nearest Sunday.
 * If today is Sunday, returns [today].
 */
export function getDatesUntilEndOfWeek(today = new Date()): Date[] {
  const dayOfWeek = today.getDay();
  const daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;

  return Array.from({ length: daysUntilSunday + 1 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return d;
  });
}
