import * as Yup from "yup";
import {
  breaksField,
  breakWithIdSchema,
  withEndAfterStart,
} from "@/src/validation/utils/timeRange";

export const DayScheduleSchema = Yup.object().shape({
  isActive: Yup.boolean().required(),
  date: Yup.string().required(),
  startAt: Yup.string().required(),
  endAt: withEndAfterStart(Yup.string().required()),
  breaks: breaksField({ itemSchema: breakWithIdSchema }),
});

export type DayScheduleFormValues = Yup.InferType<typeof DayScheduleSchema>;
