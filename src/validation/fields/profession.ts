import * as Yup from "yup";

export const professionField = Yup.string()
  .trim()
  .min(2, "Минимум 2 символа")
  .max(150, "Максимум 150 символов")
  .required("Введите профессию");
