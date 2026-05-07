import React from "react";
import { View } from "react-native";
import { FormProvider, type UseFormReturn } from "react-hook-form";
import { parseISO } from "date-fns";
import { Button, StSvg, Typography } from "@/src/components/ui";
import { RhfTextField } from "@/src/components/hookForm/rhf-text-field";
import { RhfCalendarDatePicker } from "@/src/components/hookForm/rhf-calendar-date-picker";
import { colors } from "@/src/styles/colors";
import { formatDayMonthLong } from "@/src/utils/date/formatDate";
import type { ExpenseCreateFormValues } from "@/src/validation/schemas/expenseCreate.schema";

type Props = {
  methods: UseFormReturn<ExpenseCreateFormValues>;
  title: string;
  submitTitle: string;
  isLoading: boolean;
  onSubmit: () => void;
  onDelete?: () => void;
};

const ExpenseForm = ({
  methods,
  title,
  submitTitle,
  isLoading,
  onSubmit,
  onDelete,
}: Props) => (
  <FormProvider {...methods}>
    <View className="gap-1">
      <Typography weight="semibold" className="text-display text-center">
        {title}
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
        displayFormat={(iso) => formatDayMonthLong(parseISO(iso))}
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
        numberOfLines={4}
      />

      <View className="gap-2">
        {onDelete && (
          <Button
            title="Удалить"
            variant="clear"
            onPress={onDelete}
            disabled={isLoading}
            buttonClassName="flex-1"
            textClassName="text-accent-red-500"
            leftIcon={
              <StSvg name="Trash" size={20} color={colors.accent.red[500]} />
            }
          />
        )}
        <Button
          title={submitTitle}
          onPress={onSubmit}
          loading={isLoading}
          disabled={isLoading}
          buttonClassName="flex-1"
          rightIcon={
            <StSvg name="Save_fill" size={24} color={colors.neutral[0]} />
          }
        />
      </View>
    </View>
  </FormProvider>
);

export default ExpenseForm;
