import * as Yup from "yup";
import { priceField } from "@/src/validation/fields/price";
import { durationField } from "@/src/validation/fields/duration";

export const SlotDetailsSchema = Yup.object({
  duration: durationField,
  price: priceField,
  comment: Yup.string().default(""),
});

export type SlotDetailsFormValues = Yup.InferType<typeof SlotDetailsSchema>;
