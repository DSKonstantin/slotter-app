import * as Yup from "yup";
import { titleField } from "@/src/validation/fields/title";
import { priceField } from "@/src/validation/fields/price";

export const OnboardingServiceSchema = Yup.object({
  name: titleField,
  price: priceField,
  duration: Yup.string()
    .required("Выберите длительность")
    .test(
      "is-positive-number",
      "Длительность должна быть больше 0",
      (value) => {
        if (!value) return false;
        const num = Number(value);
        return !isNaN(num) && num > 0;
      },
    ),
});

export type OnboardingServiceFormValues = Yup.InferType<
  typeof OnboardingServiceSchema
>;
