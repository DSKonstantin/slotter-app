import * as Yup from "yup";

export const nicknameField = Yup.string()
  .trim()
  .min(3, "Минимум 3 символа")
  .max(30, "Максимум 30 символов")
  .matches(/^[a-zA-Z0-9_]+$/, "Только латиница, цифры и подчёркивание")
  .required("Введите никнейм");
