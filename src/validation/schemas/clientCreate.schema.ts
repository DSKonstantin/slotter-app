import * as Yup from "yup";
import { nameField } from "@/src/validation/fields/name";
import { phoneField } from "@/src/validation/fields/phone";
import type { CustomerTag } from "@/src/store/redux/services/api-types";

export const ClientCreateSchema = Yup.object({
  name: nameField,
  phone: phoneField.optional().default(""),
  comment: Yup.string(),
  customer_tag: Yup.mixed<CustomerTag>().nullable().optional(),
});

export type ClientCreateFormValues = Yup.InferType<typeof ClientCreateSchema>;
