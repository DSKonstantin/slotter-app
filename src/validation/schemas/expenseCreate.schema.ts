import * as Yup from "yup";

export const ExpenseCreateSchema = Yup.object({
  name: Yup.string().required("Введите название"),
  amount: Yup.number()
    .typeError("Введите сумму")
    .positive("Сумма должна быть больше 0")
    .required("Введите сумму"),
  date: Yup.string().required("Укажите дату"),
  comment: Yup.string(),
});

export type ExpenseCreateFormValues = Yup.InferType<typeof ExpenseCreateSchema>;
