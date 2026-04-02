import * as Yup from "yup";

export const AccountLinksSchema = Yup.object({
  links: Yup.array()
    .of(
      Yup.object({
        url: Yup.string()
          .url("Введите корректную ссылку")
          .required("Ссылка не может быть пустой"),
      }),
    )
    .required(),
});

export type AccountLinksFormValues = Yup.InferType<typeof AccountLinksSchema>;
