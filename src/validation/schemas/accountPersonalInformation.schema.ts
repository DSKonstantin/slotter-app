import * as Yup from "yup";
import { nameField } from "@/src/validation/fields/name";
import { surnameField } from "@/src/validation/fields/surname";
import { professionField } from "@/src/validation/fields/profession";
import { avatarField } from "@/src/validation/fields/avatar";
import { nicknameField } from "@/src/validation/fields/nickname";

export const AccountPersonalInformationSchema = Yup.object({
  name: nameField,
  surname: surnameField,
  profession: professionField,
  nickname: nicknameField,
  avatar: avatarField,
});

export type AccountPersonalInformationFormValues = Yup.InferType<
  typeof AccountPersonalInformationSchema
>;
