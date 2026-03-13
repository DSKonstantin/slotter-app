import React from "react";
import { TouchableOpacity, View } from "react-native";
import { Badge, StSvg, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import type { Appointment } from "@/src/store/redux/services/api-types";
import { formatRublesFromCents } from "@/src/utils/price/formatPrice";
import { formatTimeString } from "@/src/utils/date/formatTime";

interface SlotCardProps {
  slot: Appointment;
  onPress?: () => void;
}

const STATUS_CONFIG: Partial<
  Record<
    Appointment["status"],
    {
      label: string;
      variant: "success" | "warning" | "info";
      color: string;
      icon?: React.ReactNode;
    }
  >
> = {
  pending: {
    label: "Ожидает",
    variant: "warning",
    color: colors.accent?.yellow?.[400] ?? colors.neutral[300],
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
    color: colors.primary?.blue?.[400] ?? colors.neutral[300],
  },
  arrived: {
    label: "Пришёл",
    variant: "success",
    color: colors.primary?.blue?.[400] ?? colors.neutral[300],
  },
  late: {
    label: "Опоздал",
    variant: "warning",
    color: colors.accent?.yellow?.[400] ?? colors.neutral[300],
  },
  completed: {
    label: "Завершено",
    variant: "success",
    color: colors.neutral[300],
  },
  no_show: {
    label: "Не явился",
    variant: "info",
    color: colors.neutral[300],
  },
  cancelled: {
    label: "Отменено",
    variant: "info",
    color: colors.neutral[300],
  },
};

const SlotCard = ({ slot, onPress }: SlotCardProps) => {
  const timeString = `${formatTimeString(slot.start_time)} - ${formatTimeString(slot.end_time)}`;
  const statusConfig = STATUS_CONFIG[slot.status] ?? null;
  const clientName = slot.customer.name;
  const serviceNames = slot.services.map((s) => s.name).join(", ");

  if (slot.duration <= 0) {
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onPress}
        className="rounded-base flex-row overflow-hidden bg-background-surface py-2 px-3 flex-1 mb-1"
      >
        <View className="flex-row flex-1 items-center justify-between">
          <Typography className="text-body text-neutral-900">
            {timeString}
            <Typography className="text-caption text-neutral-900">
              {clientName && ` · ${clientName}`}
            </Typography>
          </Typography>
          {statusConfig && (
            <View className="gap-2 flex-row">
              <Badge
                size="sm"
                title=""
                variant={statusConfig.variant}
                className="p-0 w-[26px]"
              />
              <StSvg name="Expand_down" size={24} color={colors.neutral[900]} />
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      className="rounded-base flex-row overflow-hidden bg-background-surface flex-1 mb-1"
    >
      <View className="flex-1 py-5 px-4">
        <View className="flex-row items-center justify-between">
          <Typography className="text-body text-neutral-900">
            {timeString}
          </Typography>
          {statusConfig && (
            <Badge
              size="sm"
              title={statusConfig.label}
              variant={statusConfig.variant}
              icon={statusConfig.icon}
            />
          )}
        </View>

        <Typography
          weight="medium"
          className="text-caption text-neutral-500 mb-1"
        >
          {clientName}
          {slot.price_cents > 0 &&
            ` | ${formatRublesFromCents(slot.price_cents)}`}
        </Typography>

        {serviceNames && (
          <Typography
            weight="regular"
            className="text-caption text-neutral-400 mb-1"
            numberOfLines={2}
          >
            {[
              serviceNames,
              slot.additional_services?.length
                ? `+ ${slot.additional_services.length} доп.`
                : null,
            ]
              .filter(Boolean)
              .join(" | ")}
          </Typography>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default SlotCard;
