import * as Yup from "yup";

export const priceField = Yup.string()
  .required("Введите цену")
  .test("is-non-negative-number", "Введите корректную цену", (value) => {
    if (!value) return false;
    const num = Number(value);
    return !isNaN(num) && num >= 0;
  });
