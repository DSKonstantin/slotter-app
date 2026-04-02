import * as Yup from "yup";
import { phoneField } from "@/src/validation/fields/phone";

export const VerifySchema = Yup.object().shape({
  phone: phoneField,
});

export type VerifyFormValues = Yup.InferType<typeof VerifySchema>;
