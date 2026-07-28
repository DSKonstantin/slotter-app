import * as Yup from "yup";
import { descriptionField } from "@/src/validation/fields/description";

export const AccountBookingConditionsSchema = Yup.object({
  appointmentConditions: descriptionField,
});

export type AccountBookingConditionsFormValues = Yup.InferType<
  typeof AccountBookingConditionsSchema
>;
