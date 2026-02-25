import * as Yup from "yup";

export const serviceFormSchema = Yup.object({
  name: Yup.string().required("Введите название"),

  price: Yup.string().required("Введите цену"),

  duration: Yup.string().required("Введите длительность"),

  description: Yup.string().ensure(),

  categoryId: Yup.number().required("Выберите категорию"),

  isAvailableOnline: Yup.boolean().required(),

  isActive: Yup.boolean().required(),
});
