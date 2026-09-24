import * as Yup from "yup";
import { unMask } from "react-native-mask-text";

const emailValidator = Yup.string().email();

export const identifierField = Yup.string()
  .required("Введите номер телефона или email")
  .test("identifier", function (value) {
    if (!value) return false;

    if (value.includes("@") || /[a-zA-Zа-яА-Я]/.test(value)) {
      return (
        emailValidator.isValidSync(value) ||
        this.createError({ message: "Некорректный email" })
      );
    }

    const digits = unMask(value);
    return (
      (digits.length === 11 && digits.startsWith("7")) ||
      this.createError({ message: "Некорректный номер телефона" })
    );
  });
