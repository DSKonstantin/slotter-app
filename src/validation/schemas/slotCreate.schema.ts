import * as Yup from "yup";

export const ServiceItemSchema = Yup.object({
  id: Yup.string().required(),
  name: Yup.string().required(),
  duration: Yup.number().required(),
  priceCents: Yup.number().required(),
});

export const SlotCreateSchema = Yup.object({
  services: Yup.array(ServiceItemSchema).required(),
  clientName: Yup.string(),
  date: Yup.string().required("Укажите дату"),
  time: Yup.string().required("Укажите время"),
  duration: Yup.number()
    .transform((value) => (isNaN(value) ? undefined : value))
    .typeError("Укажите длительность")
    .min(0, "Минимальная длительность — 0 минут")
    .required("Укажите длительность"),
  comment: Yup.string(),
  paymentMethod: Yup.string().oneOf(["cash", "sbp", "online"]).required(),
  sendNotification: Yup.boolean().required(),
});

export type SlotCreateFormValues = Yup.InferType<typeof SlotCreateSchema>;
export type ServiceItemValues = Yup.InferType<typeof ServiceItemSchema>;
