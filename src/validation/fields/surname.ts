import * as Yup from "yup";

export const surnameField = Yup.string()
  .trim()
  .min(2, "Минимум 2 символа")
  .max(50, "Максимум 50 символов")
  .required("Введите фамилию");
