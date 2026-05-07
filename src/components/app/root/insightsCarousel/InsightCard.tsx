import React from "react";
import { Pressable, TouchableOpacity, View } from "react-native";

import { StSvg, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";

export type InsightCategory = "analytics" | "tip" | "reminder" | "update";

const CATEGORY_STYLES: Record<
  InsightCategory,
  {
    label: string;
    pillBg: string;
    pillText: string;
    iconColor: string;
  }
> = {
  analytics: {
    label: "Аналитика",
    pillBg: "bg-primary-blue-100",
    pillText: "text-primary-blue-500",
    iconColor: colors.primary.blue[500],
  },
  tip: {
    label: "Совет",
    pillBg: "bg-accent-purple-100",
    pillText: "text-accent-purple-500",
    iconColor: colors.accent.purple[500],
  },
  reminder: {
    label: "Напоминание",
    pillBg: "bg-accent-orange-100",
    pillText: "text-accent-orange-500",
    iconColor: colors.accent.orange[500],
  },
  update: {
    label: "Обновление",
    pillBg: "bg-primary-green-100",
    pillText: "text-primary-green-700",
    iconColor: colors.primary.green[400],
  },
};

type Props = {
  category: InsightCategory;
  iconName: string;
  title: string;
  body: string;
  onPress: () => void;
  onDismiss?: () => void;
};

const InsightCard = ({
  category,
  iconName,
  title,
  body,
  onPress,
  onDismiss,
}: Props) => {
  const styles = CATEGORY_STYLES[category];

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      className="bg-background-surface rounded-base p-4 gap-3"
    >
      <View className="flex-row items-center justify-between">
        <View
          className={`flex-row items-center gap-1.5 px-2 py-1 rounded-full ${styles.pillBg}`}
        >
          <StSvg name={iconName} size={14} color={styles.iconColor} />
          <Typography
            weight="medium"
            className={`text-caption ${styles.pillText}`}
          >
            {styles.label}
          </Typography>
        </View>
        {onDismiss && (
          <Pressable
            hitSlop={8}
            onPress={onDismiss}
            className="active:opacity-70"
          >
            <StSvg name="Close_round" size={20} color={colors.neutral[400]} />
          </Pressable>
        )}
      </View>

      <View className="flex-row items-center gap-2">
        <View className="flex-1 gap-1">
          <Typography
            weight="semibold"
            className="text-body text-neutral-900"
            numberOfLines={2}
          >
            {title}
          </Typography>
          <Typography
            weight="regular"
            className="text-caption text-neutral-500"
            numberOfLines={2}
          >
            {body}
          </Typography>
        </View>
        <StSvg
          name="Expand_right_light"
          size={20}
          color={colors.neutral[500]}
        />
      </View>
    </TouchableOpacity>
  );
};

export default InsightCard;
