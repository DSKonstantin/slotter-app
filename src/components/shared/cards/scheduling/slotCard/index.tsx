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

const parseTime = (isoTime: string) => {
  const date = new Date(isoTime);
  if (Number.isNaN(date.getTime())) return 0;
  return date.getUTCHours() * 60 + date.getUTCMinutes();
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

  const duration = parseTime(slot.timeEnd) - parseTime(slot.timeStart);
  const isShort = duration <= 29;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      className={`rounded-base flex-row flex-1
            justify-between ${
              isFree
                ? "border bg-background border-neutral-200 px-4 py-4"
                : `${isShort ? "py-2" : "py-4"} px-4 bg-background-surface border border-transparent`
            }`}
    >
      <View className="justify-center flex-1">
        <View className="flex-row items-center justify-between">
          <Typography className="text-body">
            {isShort ? (
              <>
                {timeString} ·{" "}
                <Typography className="text-body text-neutral-500">
                  {slot.clientName}
                </Typography>
              </>
            ) : (
              timeString
            )}
          </Typography>
          {statusConfig &&
            (isShort ? (
              <View className="gap-2 flex-row">
                <Badge
                  size="sm"
                  title={""}
                  variant={statusConfig.variant}
                  icon={statusConfig.icon}
                  className="p-0 w-[26px]"
                />
                <StSvg
                  name="Expand_down"
                  size={24}
                  color={colors.neutral[900]}
                />
              </View>
            ) : (
              <Badge
                size="sm"
                title={statusConfig.label}
                variant={statusConfig.variant}
                icon={statusConfig.icon}
              />
            ))}
        </View>

        {isFree ? (
          <Typography className="text-neutral-500 text-caption">
            Свободное время
          </Typography>
        ) : (
          !isShort && (
            <>
              <Typography
                weight="medium"
                className="mt-1 text-neutral-500 text-caption"
              >
                {slot.clientName}{" "}
                {slot.price && `| ${slot.price.toLocaleString("ru-RU")} ₽`}
              </Typography>
              <Typography
                weight="regular"
                className="text-neutral-400 text-caption"
              >
                {slot.services?.join(", ")}
              </Typography>
            </>
          )
        )}
      </View>

      {isFree && (
        <View className="items-center justify-center">
          <StSvg name="Add_ring_fill" size={24} color={colors.neutral[900]} />
        </View>
      )}
    </TouchableOpacity>
  );
};

export default SlotCard;
