import React, { useState, useRef } from "react";
import {
  TouchableOpacity,
  View,
  Animated,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { Badge, StSvg, Typography, Button } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import type { Appointment } from "@/src/store/redux/services/api-types";
import { formatRublesFromCents } from "@/src/utils/price/formatPrice";
import { formatTimeString } from "@/src/utils/date/formatTime";
import { APPOINTMENT_STATUS_CONFIG } from "@/src/constants/appointmentStatuses";

interface SlotCardProps {
  slot: Appointment;
  onPress?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
}

const SlotCard = ({ slot, onPress, containerStyle }: SlotCardProps) => {
  const timeString = `${formatTimeString(slot.start_time)} - ${formatTimeString(slot.end_time)}`;
  const statusConfig = APPOINTMENT_STATUS_CONFIG[slot.status] ?? null;
  const clientName = slot.customer.name;
  const serviceNames = slot.services.map((s) => s.name).join(", ");

  const [isExpanded, setIsExpanded] = useState(false);
  const rotation = useRef(new Animated.Value(0)).current;

  const toggleExpand = () => {
    const toValue = isExpanded ? 0 : 1;
    setIsExpanded(!isExpanded);
    Animated.timing(rotation, {
      toValue,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const rotate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  const detailContent = (
    <View className="flex-1 py-5 px-4 justify-center">
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
  );

  if (slot.duration <= 29) {
    return (
      <View
        style={[
          containerStyle,
          { zIndex: isExpanded ? 10 : 1, elevation: isExpanded ? 10 : 1 },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={toggleExpand}
          className="rounded-base flex-row overflow-hidden bg-background-surface py-2 px-3 flex-1"
        >
          <View className="flex-row flex-1 items-center justify-between">
            <Typography className="text-body text-neutral-900">
              {timeString}
              <Typography className="text-caption text-neutral-900">
                {clientName && ` · ${clientName}`}
              </Typography>
            </Typography>
            {statusConfig && (
              <View className="gap-2 flex-row items-center">
                <Badge
                  size="sm"
                  title=""
                  variant={statusConfig.variant}
                  className="p-0 w-[26px]"
                />
                <Animated.View style={{ transform: [{ rotate }] }}>
                  <StSvg
                    name="Expand_down"
                    size={24}
                    color={colors.neutral[900]}
                  />
                </Animated.View>
              </View>
            )}
          </View>
        </TouchableOpacity>

        {isExpanded && (
          <View
            className="absolute left-0 right-0 bg-background-surface rounded-b-base overflow-hidden"
            style={{ top: "100%", marginTop: 0 }}
          >
            {detailContent}
            <View className="px-3 pb-3">
              <Button
                title="Открыть запись"
                variant="secondary"
                onPress={() => {
                  setIsExpanded(false);
                  onPress?.();
                }}
              />
            </View>
          </View>
        )}
      </View>
    );
  }

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      className="rounded-base flex-row overflow-hidden bg-background-surface"
      style={containerStyle}
    >
      {detailContent}
    </TouchableOpacity>
  );
};

export default SlotCard;
