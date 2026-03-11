export const parseTime = (time: string) => {
  const direct = time.match(/^(\d{2}):(\d{2})/);
  if (direct) return +direct[1] * 60 + +direct[2];
  const iso = time.match(/T(\d{2}):(\d{2})/);
  return iso ? +iso[1] * 60 + +iso[2] : 0;
};

export const formatTime = (min: number) =>
  `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;
