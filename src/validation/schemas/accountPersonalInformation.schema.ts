import * as Yup from "yup";
import { nameField } from "@/src/validation/fields/name";
import { surnameField } from "@/src/validation/fields/surname";
import { professionField } from "@/src/validation/fields/profession";
import { avatarField } from "@/src/validation/fields/avatar";

export const AccountPersonalInformationSchema = Yup.object({
  name: nameField,
  surname: surnameField,
  profession: professionField,
  avatar: avatarField,
});

export type AccountPersonalInformationFormValues = Yup.InferType<
  typeof AccountPersonalInformationSchema
>;
