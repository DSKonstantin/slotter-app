import { string } from "yup";

export const phoneField = string().required("Введите номер телефона");
