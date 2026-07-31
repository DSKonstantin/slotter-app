import * as Yup from "yup";
import { nicknameField } from "@/src/validation/fields/nickname";

export const AccountProfileSettingsSchema = Yup.object({
  nickname: nicknameField,
  tags: Yup.array().of(Yup.string().required()).default([]),
  atHome: Yup.boolean().required(),
  online: Yup.boolean().required(),
  onRoad: Yup.boolean().required(),
});

export type AccountProfileSettingsFormValues = Yup.InferType<
  typeof AccountProfileSettingsSchema
>;
