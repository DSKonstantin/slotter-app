import * as Yup from "yup";
import { descriptionField } from "@/src/validation/fields/description";

export const AccountAboutMeSchema = Yup.object({
  aboutMe: descriptionField,
});

export type AccountAboutMeFormValues = Yup.InferType<
  typeof AccountAboutMeSchema
>;
