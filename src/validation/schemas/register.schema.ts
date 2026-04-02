import * as Yup from "yup";
import { passwordField } from "@/src/validation/fields/password";

export const RegisterSchema = Yup.object().shape({
  password: passwordField,
  email: Yup.string()
    .email("Введите корректный email")
    .required("Введите email"),
});

export type RegisterFormValues = Yup.InferType<typeof RegisterSchema>;
