import * as yup from "yup";

export const AccountLinksSchema = yup.object({
  links: yup.array().of(
    yup.object({
      id: yup.number().optional(),
      title: yup.string().optional(),
      url: yup.string().url("Некорректная ссылка").required("Введите ссылку"),
    }),
  ),
});

export type AccountLinksFormValues = yup.InferType<typeof AccountLinksSchema>;
