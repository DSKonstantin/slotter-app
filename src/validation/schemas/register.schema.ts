import * as Yup from "yup";
import { passwordField } from "@/src/validation/fields/password";

export const RegisterSchema = Yup.object().shape({
  password: passwordField,
  passwordConfirmation: Yup.string()
    .required("Подтвердите пароль")
    .oneOf([Yup.ref("password")], "Пароли не совпадают"),
});

export type RegisterFormValues = Yup.InferType<typeof RegisterSchema>;
