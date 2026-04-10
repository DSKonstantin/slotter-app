import React from "react";
import { View } from "react-native";
import { Divider, Typography } from "@/src/components/ui";
import map from "lodash/map";

type IncomeItem = {
  label: string;
  value: string;
};

type Props = {
  label?: string;
  totalIncome: string;
  items: IncomeItem[];
};

const IncomeCard = ({ label = "Общий доход", totalIncome, items }: Props) => {
  return (
    <View className="bg-background-surface rounded-base p-4 gap-3">
      <View className="items-center justify-between gap-2">
        <Typography className="text-caption text-neutral-500">
          {label}
        </Typography>
        <Typography weight="semibold" className="text-display text-neutral-900">
          {totalIncome}
        </Typography>
      </View>

      <Divider className="my-4" />

      <View className="flex-row justify-between gap-2">
        {map(items, (item, index) => (
          <View className="items-center justify-between gap-1" key={index}>
            <Typography className="text-caption text-neutral-500">
              {item.label}
            </Typography>
            <Typography className="text-body text-neutral-900">
              {item.value}
            </Typography>
          </View>
        ))}
      </View>
    </View>
  );
};

export default IncomeCard;
