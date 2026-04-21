import * as Yup from "yup";
import { titleField } from "@/src/validation/fields/title";
import { priceField } from "@/src/validation/fields/price";
import { durationField } from "@/src/validation/fields/duration";
import { descriptionField } from "@/src/validation/fields/description";

export const additionalServiceFormSchema = Yup.object({
  name: titleField,
  price: priceField,
  duration: durationField,
  description: descriptionField,
  isActive: Yup.boolean().required(),
});
