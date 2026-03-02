import * as Yup from "yup";

export const additionalServiceFormSchema = Yup.object({
  name: Yup.string().required("Введите название"),

  price: Yup.string().required("Введите цену"),

  duration: Yup.string().required("Введите длительность"),

  description: Yup.string().ensure(),

  isActive: Yup.boolean().required(),
});
