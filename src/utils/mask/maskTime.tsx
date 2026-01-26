export const maskTime = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 4);

  const h = digits.slice(0, 2);
  const m = digits.slice(2, 4);

  let hh = h;
  let mm = m;

  if (hh.length === 2) {
    const hours = Math.min(Number(hh), 23);
    hh = String(hours).padStart(2, "0");
  }

  if (mm.length === 2) {
    const minutes = Math.min(Number(mm), 59);
    mm = String(minutes).padStart(2, "0");
  }

  if (digits.length <= 2) return hh;
  return `${hh}:${mm}`;
};
