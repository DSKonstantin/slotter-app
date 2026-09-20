import * as Yup from "yup";
import type { AudienceFilters } from "@/src/components/app/clients/broadcast/audienceFilter/types";

export const broadcastCreateSchema = Yup.object({
  name: Yup.string().trim().required("Укажите название рассылки"),
  message: Yup.string()
    .trim()
    .required("Введите текст сообщения")
    .max(4000, "Не длиннее 4000 символов"),
  onlyConsented: Yup.boolean().required(),
  isScheduled: Yup.boolean().required(),
  scheduledDate: Yup.string()
    .default(undefined)
    .nullable()
    .when("isScheduled", {
      is: true,
      then: (schema) => schema.required("Укажите дату"),
      otherwise: (schema) => schema.optional(),
    }),
  scheduledTime: Yup.number().when("isScheduled", {
    is: true,
    then: (schema) => schema.required("Укажите время"),
    otherwise: (schema) => schema.optional(),
  }),
  channel: Yup.string().required("Выберите канал"),
  audienceFilters: Yup.mixed<AudienceFilters>().optional(),
});

export type BroadcastCreateFormValues = Yup.InferType<
  typeof broadcastCreateSchema
>;
