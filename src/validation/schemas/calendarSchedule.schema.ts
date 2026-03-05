import * as Yup from "yup";

export const CalendarScheduleSchema = Yup.object().shape({
  selectedDays: Yup.array().of(Yup.string().required()).required().default([]),
  scheduleStart: Yup.string().required(),
  scheduleEnd: Yup.string().required(),
  breaks: Yup.array()
    .of(
      Yup.object().shape({
        start: Yup.string().required(),
        end: Yup.string().required(),
      }),
    )
    .required()
    .default([]),
});

export type CalendarScheduleFormValues = Yup.InferType<
  typeof CalendarScheduleSchema
>;
