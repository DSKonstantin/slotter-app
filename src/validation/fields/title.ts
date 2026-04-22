import * as Yup from "yup";

export const titleField = Yup.string()
  .trim()
  .min(2, "Минимум 2 символа")
  .max(100, "Максимум 100 символов")
  .required("Введите название");
