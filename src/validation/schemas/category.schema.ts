import * as Yup from "yup";

export const categorySchema = Yup.object().shape({
  name: Yup.string().required("Введите название категории"),
  color: Yup.string().nullable().optional(),
});

export type CategoryFormValues = Yup.InferType<typeof categorySchema>;
