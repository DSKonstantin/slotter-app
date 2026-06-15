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

const getSlotCardInfo = (slot: Appointment) => {
  const serviceNames = slot.services.map((service) => service.name).join(", ");
  const additionalServicesCount = slot.additional_services?.length ?? 0;

  return {
    servicesTitle: serviceNames,
    additionalServicesTitle: additionalServicesCount
      ? `+ ${additionalServicesCount} доп.`
      : "",
    clientName: slot.customer?.name ?? "",
    hasComment: Boolean(slot.comment?.trim()),
    timeString: `${formatTimeString(slot.start_time)} - ${formatTimeString(slot.end_time)}`,
    price: formatRublesFromCents(slot.price_cents),
  };
};

const SlotCard = ({
  slot,
  onPress,
  containerStyle,
  highlighted = false,
  isExpanded: controlledExpanded,
  onToggleExpand,
}: SlotCardProps) => {
  const slotInfo = getSlotCardInfo(slot);
  const statusConfig = APPOINTMENT_STATUS_CONFIG[slot.status] ?? null;

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

  const renderStatusLine = () => (
    <View
      pointerEvents="none"
      className={`w-2 rounded-full ${statusConfig.statusLineClass}`}
    />
  );

  const renderExpandIcon = () => (
    <Animated.View style={{ transform: [{ rotate }] }}>
      <StSvg name="Expand_down" size={24} color={colors.neutral[900]} />
    </Animated.View>
  );

  const renderServicesTitle = (includeClient = false) => {
    const hasServicesTitle =
      Boolean(slotInfo.servicesTitle) ||
      Boolean(slotInfo.additionalServicesTitle);

    if (!hasServicesTitle && !includeClient) return null;

    return (
      <Typography className="text-body text-neutral-900" numberOfLines={1}>
        {slotInfo.servicesTitle}
        {includeClient && slotInfo.clientName && (
          <Typography
            weight="regular"
            className="text-caption text-neutral-500"
          >
            {hasServicesTitle ? " · " : ""}
            {slotInfo.clientName}
          </Typography>
        )}
      </Typography>
    );
  };

  const detailContent = (isShort: boolean) => (
    <Pressable
      className="flex-row flex-1 px-2 py-2.5 justify-center active:opacity-70 gap-2.5"
      onPress={onPress}
    >
      {renderStatusLine()}

      <View className="flex-1 justify-center">
        <View className="flex-row items-center justify-between">
          <View className="flex-row gap-1 items-center">
            {slotInfo.hasComment && (
              <StSvg
                name="Chat_plus"
                size={20}
                color={colors.accent.orange[500]}
              />
            )}
            {renderServicesTitle()}
          </View>

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
                {renderExpandIcon()}
              </Pressable>
            )}
          </View>
        </View>

        <View className="flex-row items-center">
          <Typography
            weight="regular"
            numberOfLines={1}
            className="text-caption text-neutral-500 flex-shrink-0"
          >
            {slotInfo.clientName && `${slotInfo.clientName}  · `}
            {slotInfo.additionalServicesTitle &&
              `${slotInfo.additionalServicesTitle}  · `}
            {slotInfo.price}
          </Typography>
        </View>
        <Typography className="text-caption text-neutral-400">
          {slotInfo.timeString}
        </Typography>
      </View>
    </Pressable>
  );

  const isCompactSlot =
    slot.duration <= 30 ||
    slot.status === "cancelled" ||
    slot.status === "declined";

  if (isCompactSlot) {
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
          className="rounded-base flex-row overflow-hidden bg-background-surface p-2 flex-1 active:opacity-70 gap-2.5"
        >
          {renderStatusLine()}
          <View className="flex-row flex-1 items-center justify-between">
            <View className="flex-1 mr-2">{renderServicesTitle(true)}</View>
            {statusConfig && (
              <View className="gap-2 flex-row items-center">
                <Badge
                  size="sm"
                  title=""
                  variant={statusConfig.variant}
                  className="p-0 w-[26px]"
                />
                {renderExpandIcon()}
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
