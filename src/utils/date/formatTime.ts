import { format, parseISO, getHours, getMinutes } from "date-fns";

// Combines a date string ("YYYY-MM-DD") with a time string ("HH:MM:SS") into an ISO datetime.
export const combineDayTime = (day: string, time: string) => `${day}T${time}`;

// Formats a time string ("HH:MM:SS" or ISO "...THH:MM:SS+03:00") to "HH:MM"
export const formatTimeString = (time: string) =>
  format(parseISO(time), "HH:mm");

export const formatTime = (date: Date) => {
  if (!date) return "";
  return format(date, "HH:mm");
};

export const getTimeParts = (value: Date | null) => {
  if (!value || !(value instanceof Date) || Number.isNaN(value.getTime())) {
    return { hours: 9, minutes: 0 };
  }

  return {
    hours: getHours(value),
    minutes: getMinutes(value),
  };
};
