import React from "react";
import { ActivityIndicator, View } from "react-native";
import map from "lodash/map";
import { Divider, Typography } from "@/src/components/ui";
import { formatRublesFromCents } from "@/src/utils/price/formatPrice";
import type { ExpenseCategory } from "@/src/store/redux/services/api-types";

type Props = {
  categories: ExpenseCategory[];
  expenseByCategory: Record<string, number>;
  isLoading: boolean;
};

const ExpenseCategoriesList = ({
  categories,
  expenseByCategory,
  isLoading,
}: Props) => {
  if (isLoading) {
    return <ActivityIndicator />;
  }

  return (
    <>
      {map(categories, (category, index) => (
        <View key={category.id}>
          {index > 0 && <Divider className="mb-4" />}
          <View className="flex-row justify-between items-center">
            <Typography className="text-body text-neutral-900">
              {category.name}
            </Typography>

            <Typography weight="regular" className="text-body">
              {formatRublesFromCents(expenseByCategory[category.name] ?? 0)}
            </Typography>
          </View>
        </View>
      ))}
    </>
  );
};

export default ExpenseCategoriesList;
