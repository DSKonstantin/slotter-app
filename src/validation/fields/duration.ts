import * as Yup from "yup";

export const durationField = Yup.string()
  .required("Введите длительность")
  .test("is-positive-number", "Длительность должна быть больше 0", (value) => {
    if (!value) return false;
    const num = Number(value);
    return !isNaN(num) && num > 0;
  });
