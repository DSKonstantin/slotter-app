import * as Yup from "yup";

export const durationField = Yup.string()
  .nullable()
  .required("Введите длительность")
  .test(
    "is-valid-number",
    "Длительность не может быть отрицательной",
    (value) => {
      if (value === undefined || value === null || value === "") return false;
      const num = Number(value);
      return !isNaN(num) && num >= 0;
    },
  );
