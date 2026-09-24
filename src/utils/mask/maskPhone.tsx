import { mask } from "react-native-mask-text";

export const maskPhone = (value: string) => {
  let digits = value.replace(/\D/g, "");

  if (digits.length === 11 && digits.startsWith("8")) {
    digits = "7" + digits.slice(1);
  }

  digits = digits.slice(0, 11);

  return mask(digits, "+7 999 999-99-99");
};

export const identifierMask = (value: string) => {
  if (value.includes("@") || /[a-zA-Zа-яА-Я]/.test(value)) return value;

  const digits = value.replace(/\D/g, "");
  if (digits.length === 0) return value;

  return maskPhone(digits);
};

export const formatPhoneDisplay = (value: string) => {
  let digits = value.replace(/\D/g, "");

  if (digits.length === 11 && digits.startsWith("8")) {
    digits = "7" + digits.slice(1);
  }

  digits = digits.slice(0, 11);

  return mask(digits, "+ 7 (999) 999-99-99");
};

export const formatCallPhoneDisplay = (value: string) => {
  let digits = value.replace(/\D/g, "");

  if (digits.length === 11 && digits.startsWith("7")) {
    digits = "8" + digits.slice(1);
  }

  digits = digits.slice(0, 11);

  return mask(digits, "8 999 999 99 99");
};
