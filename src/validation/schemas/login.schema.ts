import * as Yup from "yup";
import { identifierField } from "@/src/validation/fields/identifier";

export const loginSchema = Yup.object({
  identifier: identifierField,
  password: Yup.string().required("Введите пароль"),
});

export type LoginFormValues = Yup.InferType<typeof loginSchema>;
