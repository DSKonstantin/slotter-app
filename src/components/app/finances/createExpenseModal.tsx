import React, { useCallback } from "react";
import { View } from "react-native";
import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from "@backpackapp-io/react-native-toast";
import { format } from "date-fns";
import { StModal, Button, Typography } from "@/src/components/ui";
import { RhfTextField } from "@/src/components/hookForm/rhf-text-field";
import {
  ExpenseCreateSchema,
  type ExpenseCreateFormValues,
} from "@/src/validation/schemas/expenseCreate.schema";
import { useCreateExpenseMutation } from "@/src/store/redux/services/api/financesApi";
import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";
import { getApiErrorMessage } from "@/src/utils/apiError";

type Props = {
  visible: boolean;
  onClose: () => void;
};

const CreateExpenseModal = ({ visible, onClose }: Props) => {
  const auth = useRequiredAuth();
  const [createExpense, { isLoading }] = useCreateExpenseMutation();

  const methods = useForm({
    resolver: yupResolver(ExpenseCreateSchema),
    defaultValues: {
      amount: undefined,
      description: "",
      date: format(new Date(), "yyyy-MM-dd"),
    },
  });

  const { handleSubmit, reset } = methods;

  const onSubmit = useCallback(
    async (values: ExpenseCreateFormValues) => {
      if (!auth) return;
      try {
        await createExpense({
          userId: auth.userId,
          body: {
            amount: values.amount,
            description: values.description || undefined,
            date: values.date,
            is_recurring: values.is_recurring,
          },
        }).unwrap();
        reset();
        onClose();
      } catch (error) {
        toast.error(getApiErrorMessage(error, "Не удалось создать расход"));
      }
    },
    [auth, createExpense, reset, onClose],
  );

  return (
    <StModal visible={visible} onClose={onClose} keyboardAware>
      <FormProvider {...methods}>
        <View className="gap-4 pt-2">
          <Typography weight="semibold" className="text-body text-neutral-900">
            Новый расход
          </Typography>

          <RhfTextField
            name="amount"
            label="Сумма, ₽"
            placeholder="0"
            keyboardType="numeric"
          />

          <RhfTextField
            name="description"
            label="Описание"
            placeholder="Например: закупка красок"
          />

          <RhfTextField name="date" label="Дата" placeholder="2026-04-09" />

          <Button
            title="Сохранить"
            onPress={handleSubmit(onSubmit)}
            loading={isLoading}
            disabled={isLoading}
            buttonClassName="w-full"
          />
        </View>
      </FormProvider>
    </StModal>
  );
};

export default CreateExpenseModal;
