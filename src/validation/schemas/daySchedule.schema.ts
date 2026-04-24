import * as Yup from "yup";
import { isEndAfterStart } from "@/src/validation/utils/timeRange";

export const DayScheduleSchema = Yup.object().shape({
  isActive: Yup.boolean().required(),
  date: Yup.string().required(),
  scheduleStart: Yup.string().required(),
  scheduleEnd: Yup.string()
    .required()
    .test(
      "end-after-start",
      "Время окончания должно быть позже начала",
      (endAt, context) => isEndAfterStart(context.parent.scheduleStart, endAt),
    ),
  breaks: Yup.array().of(
    Yup.object().shape({
      id: Yup.number().optional(),
      start: Yup.string().required(),
      end: Yup.string().required(),
    }),
  ),
});

export type DayScheduleFormValues = Yup.InferType<typeof DayScheduleSchema>;
