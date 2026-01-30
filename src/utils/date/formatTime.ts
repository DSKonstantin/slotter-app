export const formatTime = (date: Date) => {
  const h = date.getHours(); // 0..23 без нуля
  const m = String(date.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
};
