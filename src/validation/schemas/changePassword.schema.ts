import * as Yup from "yup";
import { passwordField } from "@/src/validation/fields/password";

export const changePasswordSchema = Yup.object({
  current_password: Yup.string().required("Введите текущий пароль"),
  password: passwordField,
  password_confirmation: Yup.string()
    .oneOf([Yup.ref("password")], "Пароли не совпадают")
    .required("Подтвердите новый пароль"),
});

export type ChangePasswordFormValues = Yup.InferType<
  typeof changePasswordSchema
>;
