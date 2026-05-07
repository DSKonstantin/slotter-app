import * as Yup from "yup";
import {
  breaksField,
  withEndAfterStart,
} from "@/src/validation/utils/timeRange";

export const OnboardingScheduleSchema = Yup.object().shape({
  startAt: Yup.string().required("Укажите время начала"),
  endAt: withEndAfterStart(Yup.string().required("Укажите время окончания")),
  workingDays: Yup.array()
    .of(Yup.string())
    .min(1, "Выберите минимум один рабочий день")
    .required("Выберите рабочие дни"),
  breaks: breaksField(),
});

export type OnboardingScheduleFormValues = Yup.InferType<
  typeof OnboardingScheduleSchema
>;
