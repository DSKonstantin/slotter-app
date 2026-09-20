import * as Yup from "yup";

export const ServiceItemSchema = Yup.object({
  id: Yup.string().required(),
  name: Yup.string().required(),
  duration: Yup.number().required(),
  priceCents: Yup.number().required(),
  /** The service's own default "break after appointment" — used to derive
   * the form's breakAfterMinutes default (the largest across all selected
   * services), not sent to the API directly. */
  breakAfterMinutes: Yup.number().default(0),
});

export const SlotCreateSchema = Yup.object({
  services: Yup.array(ServiceItemSchema).min(1, "Добавьте услугу").required(),
  customerId: Yup.number().optional(),
  date: Yup.string().required("Укажите дату"),
  time: Yup.string().required("Укажите время"),
  duration: Yup.number()
    .transform((value) => (isNaN(value) ? undefined : value))
    .typeError("Укажите длительность")
    .min(0, "Минимальная длительность — 0 минут")
    .required("Укажите длительность"),
  breakAfterMinutes: Yup.number().min(0).max(240).required(),
  comment: Yup.string(),
  paymentMethod: Yup.string().oneOf(["cash", "sbp", "online_bank"]).required(),
});

export type SlotCreateFormValues = Yup.InferType<typeof SlotCreateSchema>;
export type ServiceItemValues = Yup.InferType<typeof ServiceItemSchema>;
