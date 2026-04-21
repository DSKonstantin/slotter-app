import * as Yup from "yup";
import type { ServicePhotosValue } from "@/src/components/shared/imagePicker/serviceImagesPicker";
import { titleField } from "@/src/validation/fields/title";
import { priceField } from "@/src/validation/fields/price";
import { durationField } from "@/src/validation/fields/duration";
import { descriptionField } from "@/src/validation/fields/description";

export const serviceFormSchema = Yup.object({
  name: titleField,
  price: priceField,
  duration: durationField,
  description: descriptionField,
  categoryId: Yup.number().required("Выберите категорию"),
  isAvailableOnline: Yup.boolean().required(),
  isActive: Yup.boolean().required(),
  additionalServices: Yup.array()
    .of(Yup.object({ serviceId: Yup.number().required() }))
    .default([]),
  photos: Yup.mixed<ServicePhotosValue>().required(),
});
