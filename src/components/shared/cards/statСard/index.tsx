import React from "react";
import { View } from "react-native";
import { Tag, Typography } from "@/src/components/ui";
import type { ComponentProps } from "react";

type TagProps = ComponentProps<typeof Tag>;

type Props = {
  value: string | number;
  label: string;
  tag?: TagProps;
};

const StatCard = ({ value, label, tag }: Props) => {
  return (
    <View className="flex-1 bg-background-surface rounded-base p-4 gap-1">
      <View className="flex-row gap-2 justify-between mb-5">
        <Typography weight="semibold" className="text-body text-neutral-900">
          {value}
        </Typography>

        {tag && <Tag {...tag} />}
      </View>

      <Typography weight="semibold" className="text-body text-neutral-500">
        {label}
      </Typography>
    </View>
  );
};

export default StatCard;
