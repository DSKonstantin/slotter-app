import * as Yup from "yup";
import {
  breaksField,
  withEndAfterStart,
  EMPTY_WORKING_HOURS,
} from "@/src/validation/utils/timeRange";

const dayTemplateSchema = Yup.object().shape({
  isEnabled: Yup.boolean().required().default(false),
  startAt: Yup.string()
    .default("")
    .when("isEnabled", {
      is: true,
      then: (schema) => schema.required("Укажите время начала"),
    }),
  endAt: Yup.string()
    .default("")
    .when("isEnabled", {
      is: true,
      then: (schema) =>
        withEndAfterStart(schema.required("Укажите время окончания")),
    }),
  breaks: breaksField(),
});

export const ScheduleTemplateSchema = Yup.object().shape({
  days: Yup.array()
    .of(dayTemplateSchema)
    .required()
    .default(
      Array.from({ length: 7 }, () => ({
        isEnabled: false,
        ...EMPTY_WORKING_HOURS,
      })),
    ),
});

export type DayTemplateFormValues = Yup.InferType<typeof dayTemplateSchema>;
export type ScheduleTemplateFormValues = Yup.InferType<
  typeof ScheduleTemplateSchema
>;
