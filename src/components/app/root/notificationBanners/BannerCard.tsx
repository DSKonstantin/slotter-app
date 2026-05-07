import React from "react";
import { TouchableOpacity, View } from "react-native";

import { Button, StSvg, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";

export type BannerVariant =
  | "info"
  | "action"
  | "warning"
  | "alert"
  | "error"
  | "critical";


const VARIANTS: Record<
  BannerVariant,
  { container: string; iconColor: string }
> = {
  info: {
    container: "bg-primary-blue-100",
    iconColor: colors.primary.blue[500],
  },
  action: {
    container: "bg-primary-blue-100",
    iconColor: colors.primary.blue[500],
  },
  warning: {
    container: "bg-accent-yellow-100",
    iconColor: colors.accent.yellow[700],
  },
  alert: {
    container: "bg-accent-orange-100",
    iconColor: colors.accent.orange[500],
  },
  error: {
    container: "bg-accent-red-200",
    iconColor: colors.accent.red[500],
  },
  critical: {
    container: "bg-accent-red-200",
    iconColor: colors.accent.red[500],
  },
};

type Props = {
  variant: BannerVariant;
  iconName: string;
  title: string;
  actionLabel: string;
  onPress: () => void;
};

const BannerCard = ({
  variant,
  iconName,
  title,
  actionLabel,
  onPress,
}: Props) => {
  const styles = VARIANTS[variant];

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      className={`flex-row items-center gap-3 rounded-base p-4 ${styles.container}`}
    >
      <StSvg name={iconName} size={32} color={styles.iconColor} />
      <View className="flex-1 min-w-0">
        <Typography
          weight="semibold"
          className="text-body text-neutral-900"
          numberOfLines={2}
        >
          {title}
        </Typography>
      </View>
      <Button
        size="sm"
        variant="secondary"
        buttonClassName="rounded-xl h-[34px]"
        title={actionLabel}
        onPress={onPress}
        textClassName="text-caption"
      />
    </TouchableOpacity>
  );
};

export default BannerCard;
