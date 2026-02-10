import React from "react";
import { TouchableOpacity, View } from "react-native";
import { Badge, StSvg, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";

type ApiStatus = "pending" | "confirmed";

interface SlotCardProps {
  // variant: "free" | "booked";
  variant: string;
  time: string;

  // booked
  client?: string;
  service?: string;
  price?: string;
  status?: string;

  onPress?: () => void;
}

const STATUS_CONFIG: Record<
  ApiStatus,
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
};

const SlotCard = ({
  variant,
  time,
  client,
  service,
  price,
  status,
  onPress,
}: SlotCardProps) => {
  const isFree = variant === "free";

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      className={`rounded-base flex-row 
      justify-between
       ${isFree ? "border border-neutral-200 px-4 py-[26px]" : "p-4 bg-background-surface border border-transparent"}`}
    >
      <View className="justify-center">
        <Typography className="text-body">{time}</Typography>

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
              {client} {price && `· ${price}`}
            </Typography>
            <Typography
              weight="regular"
              className="text-neutral-400 text-caption"
            >
              {service}
            </Typography>
          </>
        )}
      </View>

      {isFree ? (
        <View className="items-center justify-center">
          <StSvg name="Add_ring_fill" size={24} color={colors.neutral[900]} />
        </View>
      ) : (
        status && (
          <Badge
            size="sm"
            title={STATUS_CONFIG[status].label}
            variant={STATUS_CONFIG[status].variant}
            icon={STATUS_CONFIG[status].icon}
          />
        )
      )}
    </TouchableOpacity>
  );
};

export default SlotCard;
