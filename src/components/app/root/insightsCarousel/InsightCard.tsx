import React from "react";
import { Pressable, Text, TouchableOpacity, View } from "react-native";

import { StSvg, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";

export type InsightCategory =
  | "analytics"
  | "tip"
  | "reminder"
  | "update"
  | "offer"
  | "event"
  | "education";

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
  education: {
    label: "Обучение",
    pillBg: "bg-primary-green-500",
    pillText: "text-primary-green-700",
    iconColor: colors.primary.green[500],
  },
  reminder: {
    label: "Напоминание",
    pillBg: "bg-accent-orange-100",
    pillText: "text-accent-orange-500",
    iconColor: colors.accent.orange[500],
  },
  update: {
    label: "Обновление",
    pillBg: "bg-primary-green-500",
    pillText: "text-primary-green-700",
    iconColor: colors.primary.green[500],
  },
  offer: {
    label: "Предложение",
    pillBg: "bg-accent-indigo-500",
    pillText: "text-primary-blue-100",
    iconColor: colors.accent.indigo[500],
  },
  event: {
    label: "Новое событие",
    pillBg: "bg-accent-mint-500",
    pillText: "text-neutral-0",
    iconColor: colors.accent.mint[500],
  },
};

export type BodyPart = {
  text: string;
  highlight?: boolean;
};

type Props = {
  category: InsightCategory;
  iconName: string;
  title: string;
  body: BodyPart[] | string;
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
    <View className="relative">
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onPress}
        className="bg-background-surface rounded-base p-4 gap-3"
      >
        <View className="flex-row items-center gap-2">
          <StSvg name={iconName} size={20} color={styles.iconColor} />
          <View
            className={`flex-row items-center gap-1.5 px-2 py-1 rounded-full ${styles.pillBg}`}
          >
            <Typography
              weight="medium"
              className={`text-caption ${styles.pillText}`}
            >
              {styles.label}
            </Typography>
          </View>
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
            <Text numberOfLines={2}>
              {Array.isArray(body) ? (
                body.map((part, idx) => (
                  <Typography
                    key={idx}
                    weight="regular"
                    className={`text-caption ${part.highlight ? "text-neutral-900" : "text-neutral-500"}`}
                  >
                    {part.text}
                  </Typography>
                ))
              ) : (
                <Typography
                  weight="regular"
                  className="text-caption text-neutral-500"
                >
                  {body}
                </Typography>
              )}
            </Text>
          </View>
          <StSvg
            name="Expand_right_light"
            size={20}
            color={colors.neutral[500]}
          />
        </View>
      </TouchableOpacity>
      {onDismiss && (
        <Pressable
          hitSlop={8}
          onPress={onDismiss}
          className="active:opacity-70"
          style={{
            position: "absolute",
            top: -10,
            right: -10,
            zIndex: 10,
          }}
        >
          <View className="bg-neutral-100 rounded-full p-1">
            <StSvg name="Close_round" size={20} color={colors.neutral[400]} />
          </View>
        </Pressable>
      )}
    </View>
  );
};

export default InsightCard;
