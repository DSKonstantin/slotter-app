export const days = [
  { id: "mon", label: "Пн", fullLabel: "Понедельник" },
  { id: "tue", label: "Вт", fullLabel: "Вторник" },
  { id: "wed", label: "Ср", fullLabel: "Среда" },
  { id: "thu", label: "Чт", fullLabel: "Четверг" },
  { id: "fri", label: "Пт", fullLabel: "Пятница" },
  { id: "sat", label: "Сб", fullLabel: "Суббота" },
  { id: "sun", label: "Вс", fullLabel: "Воскресенье" },
] as const;

// Maps JS Date.getDay() index (0=Sun) to day id
export const DAY_ID_BY_INDEX = [
  "sun",
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
] as const;
