import * as Yup from "yup";
import type { CustomerTag } from "@/src/store/redux/services/api-types";

export const ClientCreateSchema = Yup.object({
  name: Yup.string().required("Укажите имя"),
  phone: Yup.string(),
  comment: Yup.string(),
  customer_tag: Yup.mixed<CustomerTag>().nullable().optional(),
});

export type ClientCreateFormValues = Yup.InferType<typeof ClientCreateSchema>;
