import { getDate, getMonth, parseISO } from "date-fns";

export const isBirthdayToday = (birthday: string) => {
  const date = parseISO(birthday);
  const today = new Date();
  return getMonth(date) === getMonth(today) && getDate(date) === getDate(today);
};
