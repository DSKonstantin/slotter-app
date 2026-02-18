// This file contains mock data for the MonthCalendar component.

// A map of date strings ("yyyy-MM-dd") to a progress value (0 to 1).
export const mockProgressMap: Record<string, number> = {};

const today = new Date();
const year = today.getFullYear();
const month = today.getMonth();

// Generate some random-looking but stable mock data for the current month.
for (let i = 1; i <= 31; i++) {
  const day = new Date(year, month, i);
  // Only generate for days within the current month
  if (day.getMonth() === month) {
    const key = `${year}-${(month + 1).toString().padStart(2, "0")}-${i
      .toString()
      .padStart(2, "0")}`;

    // Use a simple deterministic "hash" of the day to get a stable random-like value
    const progress = ((i * 7) % 11) / 10;
    if (progress > 0.1) {
      // Leave some days empty
      mockProgressMap[key] = progress;
    }
  }
}
