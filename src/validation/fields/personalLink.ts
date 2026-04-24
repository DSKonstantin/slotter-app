import * as Yup from "yup";

export const personalLinkField = Yup.string()
  .trim()
  .min(3, "Минимум 3 символа")
  .max(30, "Максимум 30 символов")
  .matches(/^[a-zA-Z0-9._]+$/, "Только латиница, цифры, точка и подчёркивание")
  .required("Введите никнейм");
