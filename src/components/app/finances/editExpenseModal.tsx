import React, { useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from "@backpackapp-io/react-native-toast";
import { StModal } from "@/src/components/ui";
import {
  ExpenseCreateSchema,
  type ExpenseCreateFormValues,
} from "@/src/validation/schemas/expenseCreate.schema";
import { useUpdateExpenseMutation } from "@/src/store/redux/services/api/financesApi";
import { getApiErrorMessage } from "@/src/utils/apiError";
import { centsToRubles } from "@/src/utils/price/formatPrice";
import type { SummaryExpense } from "@/src/store/redux/services/api-types";
import ExpenseForm from "./ExpenseForm";

type Props = {
  visible: boolean;
  onClose: () => void;
  expense: SummaryExpense | null;
  onDelete: (expense: SummaryExpense) => void;
};

const toFormValues = (expense: SummaryExpense): ExpenseCreateFormValues => ({
  name: expense.name,
  amount: centsToRubles(expense.amount_cents),
  date: expense.date,
  comment: expense.comment ?? "",
});

const EditExpenseModal = ({ visible, onClose, expense, onDelete }: Props) => {
  const [updateExpense, { isLoading }] = useUpdateExpenseMutation();

  const methods = useForm({
    resolver: yupResolver(ExpenseCreateSchema),
  });

  const { handleSubmit, reset } = methods;

  const onSubmit = useCallback(
    async (values: ExpenseCreateFormValues) => {
      if (!expense) return;
      try {
        await updateExpense({
          expenseId: expense.id,
          body: {
            name: values.name,
            amount: values.amount,
            date: values.date,
            comment: values.comment || undefined,
          },
        }).unwrap();
        onClose();
      } catch (error) {
        toast.error(getApiErrorMessage(error, "Не удалось сохранить"));
      }
    },
    [expense, updateExpense, onClose],
  );

  useEffect(() => {
    if (visible && expense) reset(toFormValues(expense));
  }, [visible, expense, reset]);

  if (!expense) return null;

  return (
    <StModal visible={visible} onClose={onClose} keyboardAware>
      <ExpenseForm
        methods={methods}
        title="Редактировать расход"
        submitTitle="Сохранить"
        isLoading={isLoading}
        onSubmit={handleSubmit(onSubmit)}
        onDelete={() => onDelete(expense)}
      />
    </StModal>
  );
};

export default EditExpenseModal;
