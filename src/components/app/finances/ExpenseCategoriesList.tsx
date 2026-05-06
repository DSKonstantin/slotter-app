import React, { useRef } from "react";
import { ActivityIndicator, TouchableOpacity, View } from "react-native";
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
  onPressItem?: (expense: SummaryExpense) => void;
};

const ExpenseCategoriesList = ({
  expenses,
  isLoading,
  onDelete,
  onPressItem,
}: Props) => {
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

  const renderRightActions = (expense: SummaryExpense) => (
    <IconButton
      size="xs"
      onPress={() => {
        swipeableRefs.current.get(expense.id)?.close();
        onDelete?.(expense);
      }}
      buttonClassName="ml-2"
      icon={<StSvg name="Trash" size={24} color={colors.accent.red[500]} />}
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
            renderRightActions={() => renderRightActions(expense)}
            overshootRight={false}
          >
            <TouchableOpacity
              activeOpacity={0.6}
              onPress={() => onPressItem?.(expense)}
              className="flex-row justify-between items-center bg-background-surface w-full"
            >
              <View className="flex-row items-center flex-1 mr-2 gap-1.5">
                <Typography
                  numberOfLines={1}
                  className="text-body text-neutral-500 shrink"
                >
                  {expense.name}
                </Typography>
              </View>

              <Typography weight="regular" className="text-body shrink-0">
                {formatRublesFromCents(expense.amount_cents)}
              </Typography>
            </TouchableOpacity>
          </ReanimatedSwipeable>
        </View>
      ))}
    </>
  );
};

export default ExpenseCategoriesList;
