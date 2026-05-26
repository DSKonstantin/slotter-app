import React from "react";
import { Pressable, TouchableOpacity, View } from "react-native";

import { Badge, StSvg, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";

import { INSIGHT_CATEGORY_CONFIG } from "./config";

export type InsightCategory =
  | "analytics"
  | "tip"
  | "reminder"
  | "update"
  | "offer"
  | "event"
  | "education";

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
  const styles = INSIGHT_CATEGORY_CONFIG[category];

  return (
    <View className="relative">
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onPress}
        className="bg-background-surface rounded-base p-4 gap-2 min-h-[132px]"
      >
        <View className="flex-row items-center gap-2">
          <StSvg name={iconName} size={28} color={styles.color} />
          <Badge
            title={styles.label}
            size="sm"
            className={styles.pillBg}
            textStyle={{ color: styles.pillTextColor }}
          />
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
              className="text-caption text-neutral-500"
              numberOfLines={2}
            >
              {Array.isArray(body)
                ? body.map((p, i) =>
                    p.highlight ? (
                      <Typography
                        key={i}
                        className="text-caption text-neutral-900"
                      >
                        {p.text}
                      </Typography>
                    ) : (
                      p.text
                    ),
                  )
                : body}
            </Typography>
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
            top: -8,
            right: -8,
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
