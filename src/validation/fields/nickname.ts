import * as Yup from "yup";

export const NICKNAME_PATTERN = /^[a-zA-Z0-9_]+$/;

export const nicknameField = Yup.string()
  .trim()
  .min(3, "Минимум 3 символа")
  .max(30, "Максимум 30 символов")
  .matches(NICKNAME_PATTERN, "Только латиница, цифры и подчёркивание")
  .required("Введите никнейм");
