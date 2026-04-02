import * as Yup from "yup";
import { passwordField } from "@/src/validation/fields/password";

export const loginSchema = Yup.object({
  identifier: Yup.string().required("Введите номер телефона или email"),
  password: passwordField,
});

export type LoginFormValues = Yup.InferType<typeof loginSchema>;
