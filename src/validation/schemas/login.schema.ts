import * as Yup from "yup";

export const loginSchema = Yup.object({
  identifier: Yup.string().required("Введите номер телефона или email"),
  password: Yup.string().required("Введите пароль"),
});

export type LoginFormValues = Yup.InferType<typeof loginSchema>;
