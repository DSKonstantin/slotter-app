import React, { useCallback } from "react";
import { View } from "react-native";
import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from "@backpackapp-io/react-native-toast";
import { StModal, Button, Typography, StSvg } from "@/src/components/ui";
import { RhfTextField } from "@/src/components/hookForm/rhf-text-field";
import { RhfCalendarDatePicker } from "@/src/components/hookForm/rhf-calendar-date-picker";
import {
  ExpenseCreateSchema,
  type ExpenseCreateFormValues,
} from "@/src/validation/schemas/expenseCreate.schema";
import { useCreateExpenseMutation } from "@/src/store/redux/services/api/financesApi";
import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";
import { getApiErrorMessage } from "@/src/utils/apiError";
import { colors } from "@/src/styles/colors";

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
      name: "",
      amount: undefined,
      date: new Date().toISOString().split("T")[0],
      comment: "",
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
            name: values.name,
            amount: values.amount,
            date: values.date,
            comment: values.comment || undefined,
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
        <View className="gap-1">
          <Typography weight="semibold" className="text-display text-center">
            Добавить расход
          </Typography>

          <RhfTextField
            name="name"
            label="Название"
            placeholder="Например: Аренда помещения"
          />

          <RhfTextField
            name="amount"
            label="Сумма, ₽"
            placeholder="₽"
            keyboardType="numeric"
          />

          <RhfCalendarDatePicker
            name="date"
            placeholder="Введите дату"
            label="Дата"
            endAdornment={
              <StSvg
                name="Date_today_light"
                size={24}
                color={colors.neutral[500]}
              />
            }
          />

          <RhfTextField
            name="comment"
            label="Комментарий"
            placeholder="Дополнительная информация"
            multiline
          />

          <Button
            title="Добавить"
            onPress={handleSubmit(onSubmit)}
            loading={isLoading}
            disabled={isLoading}
            buttonClassName="w-full"
            rightIcon={
              <StSvg name="Check_fill" size={24} color={colors.neutral[0]} />
            }
          />
        </View>
      </FormProvider>
    </StModal>
  );
};

export default CreateExpenseModal;
