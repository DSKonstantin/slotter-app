import * as Yup from "yup";

export const OnboardingScheduleSchema = Yup.object().shape({
  workingTimeFrom: Yup.string().required("Укажите время начала"),
  workingTimeTo: Yup.string().required("Укажите время окончания"),
  workingDays: Yup.array()
    .of(Yup.string())
    .min(1, "Выберите минимум один рабочий день")
    .required("Выберите рабочие дни"),
  breaks: Yup.array(),
});

export type OnboardingScheduleFormValues = Yup.InferType<
  typeof OnboardingScheduleSchema
>;
