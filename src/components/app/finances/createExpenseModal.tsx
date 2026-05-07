import React, { useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from "@backpackapp-io/react-native-toast";
import { StModal } from "@/src/components/ui";
import {
  ExpenseCreateSchema,
  type ExpenseCreateFormValues,
} from "@/src/validation/schemas/expenseCreate.schema";
import { useCreateExpenseMutation } from "@/src/store/redux/services/api/financesApi";
import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";
import { getApiErrorMessage } from "@/src/utils/apiError";
import ExpenseForm from "./ExpenseForm";

type Props = {
  visible: boolean;
  onClose: () => void;
};

const emptyValues: ExpenseCreateFormValues = {
  name: "",
  amount: undefined as unknown as number,
  date: new Date().toISOString().split("T")[0],
  comment: "",
};

const CreateExpenseModal = ({ visible, onClose }: Props) => {
  const auth = useRequiredAuth();
  const [createExpense, { isLoading }] = useCreateExpenseMutation();

  const methods = useForm({
    resolver: yupResolver(ExpenseCreateSchema),
    defaultValues: emptyValues,
  });

  const { handleSubmit, reset } = methods;

  useEffect(() => {
    if (visible) reset(emptyValues);
  }, [visible, reset]);

  const onSubmit = useCallback(
    async (values: ExpenseCreateFormValues) => {
      if (!auth) return;
      try {
        await createExpense({
          userId: auth.userId,
          body: {
            name: values.name,
            amount: values.amount,
            date: values.date,
            comment: values.comment || undefined,
          },
        }).unwrap();
        reset(emptyValues);
        onClose();
      } catch (error) {
        toast.error(getApiErrorMessage(error, "Не удалось создать расход"));
      }
    },
    [auth, createExpense, reset, onClose],
  );

  return (
    <StModal visible={visible} onClose={onClose} keyboardAware>
      <ExpenseForm
        methods={methods}
        title="Добавить расход"
        submitTitle="Добавить"
        isLoading={isLoading}
        onSubmit={handleSubmit(onSubmit)}
      />
    </StModal>
  );
};

export default CreateExpenseModal;
