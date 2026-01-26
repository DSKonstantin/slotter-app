import { mask } from "react-native-mask-text";

export const maskPhone = (value: string) => {
  let digits = value.replace(/\D/g, "");

  if (digits.length === 11 && digits.startsWith("8")) {
    digits = "7" + digits.slice(1);
  }

  digits = digits.slice(0, 11);

  return mask(digits, "+7 999 999-99-99");
};
