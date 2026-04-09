import * as Yup from "yup";

export const ExpenseCreateSchema = Yup.object({
  amount: Yup.number()
    .typeError("Введите сумму")
    .positive("Сумма должна быть больше 0")
    .required("Введите сумму"),
  description: Yup.string(),
  date: Yup.string().required("Укажите дату"),
  is_recurring: Yup.boolean().default(false),
});

export type ExpenseCreateFormValues = Yup.InferType<typeof ExpenseCreateSchema>;
