import * as Yup from "yup";
import type { AppointmentStep } from "@/src/store/redux/services/api-types";

export const AccountBookingSchema = Yup.object({
  autoConfirm: Yup.boolean().required(),
  bookingStep: Yup.mixed<AppointmentStep>().required(),
});

export type AccountBookingFormValues = Yup.InferType<
  typeof AccountBookingSchema
>;
