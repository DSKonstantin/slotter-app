import * as Yup from "yup";

export const EditCustomerNameSchema = Yup.object({
  name: Yup.string().trim().min(1, "Введите имя").required("Введите имя"),
});

export type EditCustomerNameFormValues = Yup.InferType<
  typeof EditCustomerNameSchema
>;
