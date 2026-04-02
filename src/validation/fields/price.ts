import * as Yup from "yup";

export const priceField = Yup.string().required("Введите цену");
