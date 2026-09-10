import * as Yup from "yup";
import type { AudienceFilters } from "@/src/components/app/clients/broadcast/broadcastMock";

export const broadcastCreateSchema = Yup.object({
  name: Yup.string().trim().required("Укажите название рассылки"),
  message: Yup.string().trim().required("Введите текст сообщения"),
  onlyConsented: Yup.boolean().required(),
  isScheduled: Yup.boolean().required(),
  scheduledDate: Yup.object({
    from: Yup.string().required(),
    to: Yup.string().required(),
  })
    .default(undefined)
    .nullable()
    .when("isScheduled", {
      is: true,
      then: (schema) => schema.required("Укажите период"),
      otherwise: (schema) => schema.optional(),
    }),
  scheduledTime: Yup.number().when("isScheduled", {
    is: true,
    then: (schema) => schema.required("Укажите время"),
    otherwise: (schema) => schema.optional(),
  }),
  channel: Yup.string().optional(),
  audienceFilters: Yup.mixed<AudienceFilters>().optional(),
});

export type BroadcastCreateFormValues = Yup.InferType<
  typeof broadcastCreateSchema
>;
