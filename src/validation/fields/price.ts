import * as Yup from "yup";

export const priceField = Yup.string()
  .required("Введите цену")
  .test("is-non-negative-number", "Введите корректную цену", (value) => {
    const trimmed = value?.trim() ?? "";
    if (!trimmed) return false;
    const num = Number(trimmed);
    return Number.isFinite(num) && num >= 0;
  });
