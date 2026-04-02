import * as Yup from "yup";

export const customerTagSchema = Yup.object({
  name: Yup.string().required("Введите название"),
  color: Yup.string().nullable().optional(),
});

export type CustomerTagFormValues = Yup.InferType<typeof customerTagSchema>;
