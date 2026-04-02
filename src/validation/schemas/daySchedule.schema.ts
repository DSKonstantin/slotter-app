import * as Yup from "yup";

export const DayScheduleSchema = Yup.object().shape({
  isActive: Yup.boolean().required(),
  date: Yup.string().required(),
  scheduleStart: Yup.string().required(),
  scheduleEnd: Yup.string().required(),
  breaks: Yup.array().of(
    Yup.object().shape({
      id: Yup.number().optional(),
      start: Yup.string().required(),
      end: Yup.string().required(),
    }),
  ),
});

export type DayScheduleFormValues = Yup.InferType<typeof DayScheduleSchema>;
