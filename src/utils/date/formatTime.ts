// Combines a date string ("YYYY-MM-DD") with a time string ("HH:MM:SS") into an ISO datetime.
export const combineDayTime = (day: string, time: string) => `${day}T${time}`;

export const formatTime = (date: Date) => {
  if (!date) {
    return "";
  }

  const h = String(date.getHours()).padStart(2, "0");
  const m = String(date.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
};

export const getTimeParts = (value: Date | null) => {
  if (!value || !(value instanceof Date) || Number.isNaN(value.getTime())) {
    return { hours: 9, minutes: 0 };
  }

  return {
    hours: value.getHours(),
    minutes: value.getMinutes(),
  };
};
