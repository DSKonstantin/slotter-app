import * as yup from "yup";

export const AccountLinksSchema = yup.object({
  address: yup.string().max(300, "Максимум 300 символов").default(""),
  hideAddress: yup.boolean().required(),
  links: yup.array().of(
    yup.object({
      id: yup.number().optional(),
      title: yup.string().trim().max(100, "Максимум 100 символов").optional(),
      url: yup.string().url("Некорректная ссылка").required("Введите ссылку"),
    }),
  ),
});

export type AccountLinksFormValues = yup.InferType<typeof AccountLinksSchema>;
