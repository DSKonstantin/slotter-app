import * as Yup from "yup";
import { titleField } from "@/src/validation/fields/title";

export const categorySchema = Yup.object().shape({
  name: titleField,
  color: Yup.string().nullable().optional(),
});

export type CategoryFormValues = Yup.InferType<typeof categorySchema>;
