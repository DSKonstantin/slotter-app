import * as Yup from "yup";

export const surnameField = Yup.string()
  .trim()
  .min(2, "Минимум 2 символа")
  .max(30, "Максимум 30 символов")
  .required("Введите фамилию");
