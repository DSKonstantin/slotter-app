import * as Yup from "yup";

export const priceField = Yup.string()
  .required("Введите цену")
  .test("is-positive-number", "Цена должна быть больше 0", (value) => {
    if (!value) return false;
    const num = Number(value);
    return !isNaN(num) && num > 0;
  });
