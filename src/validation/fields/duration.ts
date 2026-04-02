import * as Yup from "yup";

export const durationField = Yup.string().required("Введите длительность");
