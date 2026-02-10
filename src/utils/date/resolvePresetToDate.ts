import { addDays, startOfDay } from "date-fns";

export const resolvePresetToDate = (value: string) => {
  const today = startOfDay(new Date());

  switch (value) {
    case "today":
      return today;
    case "tomorrow":
      return addDays(today, 1);
    case "after_tomorrow":
      return addDays(today, 2);
    default:
      return today;
  }
};
