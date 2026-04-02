import * as Yup from "yup";
import { nameField } from "@/src/validation/fields/name";
import { surnameField } from "@/src/validation/fields/surname";
import { professionField } from "@/src/validation/fields/profession";
import { avatarField } from "@/src/validation/fields/avatar";

export const PersonalInformationSchema = Yup.object({
  name: nameField,
  surname: surnameField,
  profession: professionField,
  address: Yup.string().notRequired(),
  atHome: Yup.boolean().required(),
  online: Yup.boolean().required(),
  onRoad: Yup.boolean().required(),
  hideAddress: Yup.boolean().required(),
  avatar: avatarField,
});

export type PersonalInformationFormValues = Yup.InferType<
  typeof PersonalInformationSchema
>;
