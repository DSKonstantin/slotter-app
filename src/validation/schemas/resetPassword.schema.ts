import * as Yup from "yup";
import { phoneField } from "@/src/validation/fields/phone";
import { passwordField } from "@/src/validation/fields/password";

export const resetPasswordPhoneSchema = Yup.object({
  phone: phoneField,
});

export const resetPasswordNewSchema = Yup.object({
  password: passwordField,
  password_confirmation: Yup.string()
    .oneOf([Yup.ref("password")], "Пароли не совпадают")
    .required("Подтвердите пароль"),
});

export type ResetPasswordPhoneValues = Yup.InferType<
  typeof resetPasswordPhoneSchema
>;
export type ResetPasswordNewValues = Yup.InferType<typeof resetPasswordNewSchema>;
