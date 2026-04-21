import React from "react";
import { ActivityIndicator, View } from "react-native";
import map from "lodash/map";
import { Divider, Typography } from "@/src/components/ui";
import { formatRublesFromCents } from "@/src/utils/price/formatPrice";
import type { SummaryExpense } from "@/src/store/redux/services/api-types";

type Props = {
  expenses: SummaryExpense[];
  isLoading: boolean;
};

const ExpenseCategoriesList = ({ expenses, isLoading }: Props) => {
  if (isLoading) {
    return <ActivityIndicator />;
  }

  if (!expenses.length) {
    return (
      <Typography className="text-body text-neutral-400 text-center py-2">
        Нет записей о расходах
      </Typography>
    );
  }

  return (
    <>
      {map(expenses, (expense, index) => (
        <View key={expense.id}>
          {index > 0 && <Divider className="mb-4" />}
          <View className="flex-row justify-between items-center">
            <Typography className="text-body text-neutral-900">
              {expense.name}
            </Typography>

            <Typography weight="regular" className="text-body">
              {formatRublesFromCents(expense.amount_cents)}
            </Typography>
          </View>
        </View>
      ))}
    </>
  );
};

export default ExpenseCategoriesList;
