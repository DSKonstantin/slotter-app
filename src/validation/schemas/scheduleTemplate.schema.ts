import * as Yup from "yup";
import { isEndAfterStart, breaksField } from "@/src/validation/utils/timeRange";

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
      then: (schema) => schema.required("Укажите время окончания"),
    })
    .when(["isEnabled", "startAt"], {
      is: (isEnabled: boolean, startAt: string) => isEnabled && !!startAt,
      then: (schema) =>
        schema.test(
          "end-after-start",
          "Время окончания должно быть позже начала",
          (endAt, context) => isEndAfterStart(context.parent.startAt, endAt),
        ),
    }),
  breaks: breaksField("startAt", "endAt"),
});

export const ScheduleTemplateSchema = Yup.object().shape({
  days: Yup.array()
    .of(dayTemplateSchema)
    .required()
    .default(
      Array.from({ length: 7 }, () => ({
        isEnabled: false,
        startAt: "",
        endAt: "",
        breaks: [],
      })),
    ),
});

export type DayTemplateFormValues = Yup.InferType<typeof dayTemplateSchema>;
export type ScheduleTemplateFormValues = Yup.InferType<
  typeof ScheduleTemplateSchema
>;
