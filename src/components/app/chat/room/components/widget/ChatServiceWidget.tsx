import React from "react";
import { Pressable, View } from "react-native";
import { Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import { formatRublesFromCents } from "@/src/utils/price/formatPrice";
import type { ChatWidgetService } from "@/src/store/redux/services/api-types";

type Props = {
  service: ChatWidgetService | null;
  onLongPress?: () => void;
};

const ChatServiceWidget = ({ service, onLongPress }: Props) => {
  if (!service) {
    return (
      <Pressable
        onLongPress={onLongPress}
        className="rounded-xl overflow-hidden px-4 py-4 items-center"
        style={{
          backgroundColor: colors.neutral[0],
          width: 280,
          margin: 4,
        }}
      >
        <Typography className="text-caption text-neutral-400">
          Услуга больше недоступна
        </Typography>
      </Pressable>
    );
  }

  return (
    <Pressable
      onLongPress={onLongPress}
      className="rounded-xl overflow-hidden"
      style={{
        backgroundColor: colors.neutral[0],
        width: 280,
        margin: 4,
      }}
    >
      <View className="px-4 py-3 gap-1">
        <Typography
          weight="semibold"
          className="text-body text-neutral-900"
          numberOfLines={2}
        >
          {service.name}
        </Typography>
        <View className="flex-row justify-between items-center">
          <Typography className="text-caption text-neutral-500">
            {service.duration} мин
          </Typography>
          <Typography weight="semibold" className="text-body text-neutral-900">
            {formatRublesFromCents(service.price_cents)}
          </Typography>
        </View>
      </View>
    </Pressable>
  );
};

export default ChatServiceWidget;
