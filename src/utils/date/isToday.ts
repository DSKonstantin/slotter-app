import { format } from "date-fns";

export const isToday = (dateString: string): boolean => {
  return dateString === format(new Date(), "yyyy-MM-dd");
};
