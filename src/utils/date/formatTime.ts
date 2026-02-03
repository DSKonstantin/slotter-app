export const formatTime = (date: Date) => {
  if (!date) {
    return "";
  }

  const h = date.getHours();
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
