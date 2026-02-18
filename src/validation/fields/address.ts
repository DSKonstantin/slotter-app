import * as Yup from "yup";

export const addressField = Yup.string()
  .trim()
  .min(5, "Слишком короткий адрес")
  .max(100, "Максимум 100 символов")
  .required("Введите адрес");
