import * as Yup from "yup";
import { titleField } from "@/src/validation/fields/title";

export const customerTagSchema = Yup.object({
  name: titleField,
  color: Yup.string().nullable().optional(),
});

export type CustomerTagFormValues = Yup.InferType<typeof customerTagSchema>;
