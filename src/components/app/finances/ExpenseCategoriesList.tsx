import React, { useRef } from "react";
import { ActivityIndicator, View } from "react-native";
import ReanimatedSwipeable, {
  type SwipeableMethods,
} from "react-native-gesture-handler/ReanimatedSwipeable";
import map from "lodash/map";
import { Divider, IconButton, StSvg, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import { formatRublesFromCents } from "@/src/utils/price/formatPrice";
import type { SummaryExpense } from "@/src/store/redux/services/api-types";

type Props = {
  expenses: SummaryExpense[];
  isLoading: boolean;
  onDelete?: (expense: SummaryExpense) => void;
};

const ExpenseCategoriesList = ({ expenses, isLoading, onDelete }: Props) => {
  const swipeableRefs = useRef<Map<number, SwipeableMethods>>(new Map());

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

  const renderLeftActions = (expense: SummaryExpense) => (
    <IconButton
      onPress={() => {
        swipeableRefs.current.get(expense.id)?.close();
        onDelete?.(expense);
      }}
      buttonClassName="bg-accent-red-500 rounded-small mr-2"
      icon={<StSvg name="Trash" size={24} color={colors.neutral[0]} />}
    />
  );

  return (
    <>
      {map(expenses, (expense, index) => (
        <View key={expense.id}>
          {index > 0 && <Divider className="mb-4" />}
          <ReanimatedSwipeable
            ref={
              ((ref: SwipeableMethods | null) => {
                if (ref) swipeableRefs.current.set(expense.id, ref);
                else swipeableRefs.current.delete(expense.id);
              }) as never
            }
            renderLeftActions={() => renderLeftActions(expense)}
            overshootLeft={false}
          >
            <View className="flex-row justify-between items-center bg-background-surface w-full">
              <Typography
                numberOfLines={1}
                className="text-body text-neutral-500 flex-1 mr-2"
              >
                {expense.name}
              </Typography>

              <Typography weight="regular" className="text-body shrink-0">
                {formatRublesFromCents(expense.amount_cents)}
              </Typography>
            </View>
          </ReanimatedSwipeable>
        </View>
      ))}
    </>
  );
};

export default ExpenseCategoriesList;
