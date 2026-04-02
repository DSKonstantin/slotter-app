import * as Yup from "yup";

export const RescheduleSchema = Yup.object({
  date: Yup.string()
    .required("Укажите дату")
    .matches(/^\d{4}-\d{2}-\d{2}$/, "Формат: YYYY-MM-DD"),
  start_time: Yup.string().required("Выберите время"),
  reason: Yup.string(),
  send_notification: Yup.boolean().required(),
});

export type RescheduleFormValues = Yup.InferType<typeof RescheduleSchema>;
