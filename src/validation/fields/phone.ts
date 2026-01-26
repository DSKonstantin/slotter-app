import { string } from "yup";
import { unMask } from "react-native-mask-text";

export const phoneField = string()
  .required("Введите номер телефона")
  .test("phone", "Введите корректный номер телефона", (value) => {
    if (!value) return false;

    const digits = unMask(value);
    return digits.length === 11 && digits.startsWith("7");
  });
