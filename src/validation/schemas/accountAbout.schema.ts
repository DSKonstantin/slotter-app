import * as Yup from "yup";
import { descriptionField } from "@/src/validation/fields/description";

export const AccountAboutSchema = Yup.object({
  aboutMe: descriptionField,
  tags: Yup.array().of(Yup.string().required()).default([]),
  address: Yup.string().max(100, "Максимум 100 символов").default(""),
  hideAddress: Yup.boolean().required(),
  atHome: Yup.boolean().required(),
  online: Yup.boolean().required(),
  onRoad: Yup.boolean().required(),
});

export type AccountAboutFormValues = Yup.InferType<typeof AccountAboutSchema>;
