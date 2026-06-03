import * as Yup from "yup";
import { phoneField } from "@/src/validation/fields/phone";

export const VerifySchema = Yup.object().shape({
  phone: phoneField,
  promoCode: Yup.string().when((value, schema) =>
    value?.[0]?.length > 0
      ? schema.min(4, "Минимум 4 символа").max(16, "Максимум 16 символов")
      : schema.optional(),
  ),
});

export type VerifyFormValues = Yup.InferType<typeof VerifySchema>;
