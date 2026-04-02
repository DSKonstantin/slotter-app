import * as Yup from "yup";

export const OnboardingServiceSchema = Yup.object().shape({});

export type OnboardingServiceFormValues = Yup.InferType<
  typeof OnboardingServiceSchema
>;
