import * as Yup from "yup";

export const AccountProfileSettingsSchema = Yup.object({
  tags: Yup.array().of(Yup.string().required()).default([]),
  atHome: Yup.boolean().required(),
  online: Yup.boolean().required(),
  onRoad: Yup.boolean().required(),
});

export type AccountProfileSettingsFormValues = Yup.InferType<
  typeof AccountProfileSettingsSchema
>;
