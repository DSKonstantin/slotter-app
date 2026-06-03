import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Animated,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
  Pressable,
} from "react-native";
import { Badge, StSvg, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import type { Appointment } from "@/src/store/redux/services/api-types";
import { formatRublesFromCents } from "@/src/utils/price/formatPrice";
import { formatTimeString } from "@/src/utils/date/formatTime";
import { APPOINTMENT_STATUS_CONFIG } from "@/src/constants/appointmentStatuses";

interface SlotCardProps {
  slot: Appointment;
  onPress?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
  highlighted?: boolean;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

const SlotCard = ({
  slot,
  onPress,
  containerStyle,
  highlighted = false,
  isExpanded: controlledExpanded,
  onToggleExpand,
}: SlotCardProps) => {
  const timeString = `${formatTimeString(slot.start_time)} - ${formatTimeString(slot.end_time)}`;
  const statusConfig = APPOINTMENT_STATUS_CONFIG[slot.status] ?? null;
  const clientName = slot.customer?.name ?? "";
  const serviceNames = slot.services.map((s) => s.name).join(", ");

  const [internalExpanded, setInternalExpanded] = useState(false);
  const isExpanded = controlledExpanded ?? internalExpanded;
  const rotation = useRef(new Animated.Value(0)).current;
  const highlightOpacity = useRef(new Animated.Value(0)).current;

  const rotate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  const toggleExpand = () => {
    if (onToggleExpand) {
      onToggleExpand();
    } else {
      setInternalExpanded((prev) => !prev);
    }
  };

  useEffect(() => {
    Animated.timing(rotation, {
      toValue: isExpanded ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [isExpanded, rotation]);

  useEffect(() => {
    if (!highlighted) return;
    highlightOpacity.setValue(1);
    Animated.timing(highlightOpacity, {
      toValue: 0,
      duration: 3000,
      useNativeDriver: true,
    }).start();
  }, [highlighted, highlightOpacity]);

  const statusLineClass =
    slot?.status === "pending"
      ? "bg-accent-yellow-500"
      : slot?.status === "confirmed"
        ? "bg-primary-green-500"
        : null;

  const detailContent = (isShort: boolean) => (
    <Pressable className="flex-row flex-1 active:opacity-70" onPress={onPress}>
      <View className={`flex-1 py-5 px-4 justify-center`}>
        <View className="flex-row gap-2.5">
          {statusLineClass && (
            <View
              pointerEvents="none"
              className={`w-2 rounded-full ${statusLineClass}`}
            />
          )}

          <View className="flex-1">
            <View className="flex-row items-center justify-between">
              <Typography className="text-body text-neutral-900">
                {timeString}
              </Typography>
              <View className="flex-row items-center gap-2">
                {statusConfig && (
                  <Badge
                    size="sm"
                    title={statusConfig.label}
                    variant={statusConfig.variant}
                    icon={statusConfig.icon}
                  />
                )}
                {isShort && (
                  <Pressable
                    hitSlop={8}
                    onPress={toggleExpand}
                    className="active:opacity-70"
                  >
                    <Animated.View style={{ transform: [{ rotate }] }}>
                      <StSvg
                        name="Expand_down"
                        size={24}
                        color={colors.neutral[900]}
                      />
                    </Animated.View>
                  </Pressable>
                )}
              </View>
            </View>

            <Typography
              weight="medium"
              className="text-caption text-neutral-500 mb-1"
            >
              {clientName && `${clientName} | `}
              {slot.price_cents > 0 &&
                `${formatRublesFromCents(slot.price_cents)}`}
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
        </View>
      </View>
    </Pressable>
  );

  if (slot.duration <= 29) {
    return (
      <View
        className="relative"
        style={[
          containerStyle,
          { zIndex: isExpanded ? 10 : 1, elevation: isExpanded ? 10 : 1 },
        ]}
      >
        <Animated.View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            styles.highlight,
            { opacity: highlightOpacity },
          ]}
        />
        <Pressable
          onPress={toggleExpand}
          className="rounded-base flex-row overflow-hidden bg-background-surface py-2 px-4 flex-1 active:opacity-70 gap-2.5"
        >
          {statusLineClass && (
            <View
              pointerEvents="none"
              className={`w-2 rounded-full ${statusLineClass}`}
            />
          )}
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
        </Pressable>

        {isExpanded && (
          <View
            className="absolute left-0 right-0 rounded-t-base bg-background-surface rounded-b-base overflow-hidden"
            style={{
              top: 0,
              marginTop: 0,
              boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.08)",
            }}
          >
            {detailContent(true)}
          </View>
        )}
      </View>
    );
  }

  return (
    <View
      className="rounded-base overflow-hidden bg-background-surface"
      style={containerStyle}
    >
      <Animated.View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          styles.highlight,
          { opacity: highlightOpacity },
        ]}
      />
      {detailContent(false)}
    </View>
  );
};

const styles = StyleSheet.create({
  highlight: {
    backgroundColor: "#3B82F6",
    borderRadius: 14,
    zIndex: 1,
  },
});

export default SlotCard;
