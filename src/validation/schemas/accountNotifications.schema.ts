import * as Yup from "yup";

export const AccountNotificationsSchema = Yup.object({
  newBooking: Yup.boolean().required(),
  clientCancellation: Yup.boolean().required(),
  reminders: Yup.boolean().required(),
});

export type AccountNotificationsFormValues = Yup.InferType<
  typeof AccountNotificationsSchema
>;
