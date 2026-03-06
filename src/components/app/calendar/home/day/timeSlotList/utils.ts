export const parseTime = (iso: string) => {
  const m = iso.match(/T(\d{2}):(\d{2})/);
  return m ? +m[1] * 60 + +m[2] : 0;
};

export const formatTime = (min: number) =>
  `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;
