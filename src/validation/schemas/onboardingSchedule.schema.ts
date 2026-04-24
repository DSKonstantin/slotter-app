import * as Yup from "yup";
import { isEndAfterStart, breaksField } from "@/src/validation/utils/timeRange";

export const OnboardingScheduleSchema = Yup.object().shape({
  workingTimeFrom: Yup.string().required("Укажите время начала"),
  workingTimeTo: Yup.string()
    .required("Укажите время окончания")
    .test(
      "end-after-start",
      "Время окончания должно быть позже начала",
      (endAt, context) =>
        isEndAfterStart(context.parent.workingTimeFrom, endAt),
    ),
  workingDays: Yup.array()
    .of(Yup.string())
    .min(1, "Выберите минимум один рабочий день")
    .required("Выберите рабочие дни"),
  breaks: breaksField("workingTimeFrom", "workingTimeTo"),
});

export type OnboardingScheduleFormValues = Yup.InferType<
  typeof OnboardingScheduleSchema
>;
