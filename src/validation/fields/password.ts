import * as Yup from "yup";

const PASSWORD_REQUIREMENTS_MESSAGE =
  "Пароль не соответствует требованиям. Минимум 8 символов, строчные и заглавные буквы, цифры";

export const passwordField = Yup.string()
  .min(8, PASSWORD_REQUIREMENTS_MESSAGE)
  .matches(
    /^[A-Za-z0-9!@#$%^&*()_+=\-{}[\]:;"'<>,.?/\\|~`]+$/,
    PASSWORD_REQUIREMENTS_MESSAGE,
  )
  .matches(/[a-z]/, PASSWORD_REQUIREMENTS_MESSAGE)
  .matches(/[A-Z]/, PASSWORD_REQUIREMENTS_MESSAGE)
  .matches(/\d/, PASSWORD_REQUIREMENTS_MESSAGE)
  .required(PASSWORD_REQUIREMENTS_MESSAGE);
