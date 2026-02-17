import React from "react";
import { TouchableOpacity, View } from "react-native";
import { Badge, StSvg, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import type { Schedule } from "@/src/store/redux/slices/calendarSlice";

interface SlotCardProps {
  slot: Schedule;
  onPress?: () => void;
}

const STATUS_CONFIG: Record<
  "pending" | "confirmed" | "cancelled",
  {
    label: string;
    variant: "success" | "warning" | "info";
    icon?: React.ReactNode;
  }
> = {
  pending: {
    label: "Ожидает",
    variant: "warning",
    icon: (
      <StSvg
        name="Expand_right"
        size={16}
        color={colors.accent?.yellow?.[700] ?? colors.neutral[900]}
      />
    ),
  },
  confirmed: {
    label: "Подтверждено",
    variant: "success",
  },
  cancelled: {
    label: "Отменено",
    variant: "info",
    icon: (
      <StSvg name="Close_round_fill" size={16} color={colors.neutral[500]} />
    ),
  },
};

const formatTime = (isoTime: string) => {
  const date = new Date(isoTime);
  const hours = date.getUTCHours().toString().padStart(2, "0");
  const minutes = date.getUTCMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
};

const SlotCard = ({ slot, onPress }: SlotCardProps) => {
  const isFree = slot.status === "available";
  const timeString = `${formatTime(slot.timeStart)} - ${formatTime(
    slot.timeEnd,
  )}`;
  const statusConfig =
    slot.status === "available" || !slot.status
      ? null
      : STATUS_CONFIG[slot.status];

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      className={`rounded-base flex-row 
      justify-between
       ${
         isFree
           ? "border border-neutral-200 px-4 py-4"
           : "p-4 bg-background-surface border border-transparent"
       }`}
    >
      <View className="justify-center flex-1">
        <Typography className="text-body">{timeString}</Typography>

        {isFree ? (
          <Typography className="text-neutral-500 text-caption">
            Свободное время
          </Typography>
        ) : (
          <>
            <Typography
              weight="medium"
              className="mt-1 text-neutral-500 text-caption"
            >
              {slot.clientName}{" "}
              {slot.price && `· ${slot.price.toLocaleString("ru-RU")} ₽`}
            </Typography>
            <Typography
              weight="regular"
              className="text-neutral-400 text-caption"
            >
              {slot.services?.join(", ")}
            </Typography>
          </>
        )}
      </View>

      {isFree ? (
        <View className="items-center justify-center">
          <StSvg name="Add_ring_fill" size={24} color={colors.neutral[900]} />
        </View>
      ) : (
        statusConfig && (
          <Badge
            size="sm"
            title={statusConfig.label}
            variant={statusConfig.variant}
            icon={statusConfig.icon}
          />
        )
      )}
    </TouchableOpacity>
  );
};

export default SlotCard;
