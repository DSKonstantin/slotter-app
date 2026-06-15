import React, { useMemo } from "react";
import { ActivityIndicator, Pressable, View } from "react-native";
import { StSvg, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import { useGetAvailableSlotsQuery } from "@/src/store/redux/services/api/appointmentsApi";
import { formatSlotDate } from "@/src/utils/date/formatDate";
import { parseISO } from "date-fns";
import RetryInline from "@/src/components/shared/retryInline";
import { useSlotStep } from "@/src/hooks/useSlotStep";
import { groupSlotsByHour } from "@/src/utils/schedule/groupSlotsByHour";

const SLOT_BTN_CLASS =
  "px-4 py-3 rounded-base bg-background-surface items-center active:opacity-70";
const SLOT_BTN_STYLE = { minWidth: 88 };

type Props = {
  userId: number;
  date: string;
  isSubmitting?: boolean;
  selectedHour: string | null;
  onSelectHour: (hour: string | null) => void;
  onPick: (startTime: string) => void;
};

const SlotPicker = ({
  userId,
  date,
  isSubmitting,
  selectedHour,
  onSelectHour,
  onPick,
}: Props) => {
  const { stepMinutes, useHourGrouping } = useSlotStep();

  const {
    data: slots,
    isLoading,
    isError,
    refetch,
  } = useGetAvailableSlotsQuery(
    { userId, date: formatSlotDate(parseISO(date)), step: stepMinutes },
    { refetchOnMountOrArgChange: true },
  );

  const slotsByHour = useMemo(() => groupSlotsByHour(slots ?? []), [slots]);

  if (isLoading) {
    return (
      <View className="items-center py-6">
        <ActivityIndicator color={colors.neutral[400]} />
      </View>
    );
  }
  if (isError && !slots) {
    return (
      <View className="py-6">
        <RetryInline
          text="Не удалось загрузить слоты"
          onRetry={refetch}
          layout="column"
        />
      </View>
    );
  }
  if (!slots || slots.length === 0) {
    return (
      <View className="items-center py-6">
        <Typography className="text-neutral-400">
          Нет свободных слотов
        </Typography>
      </View>
    );
  }

  if (!useHourGrouping) {
    return (
      <View className="flex-row flex-wrap gap-2">
        {slots.map((slot) => (
          <Pressable
            key={slot}
            disabled={isSubmitting}
            onPress={() => onPick(slot)}
            className={SLOT_BTN_CLASS}
            style={SLOT_BTN_STYLE}
          >
            <Typography
              weight="semibold"
              className="text-body text-neutral-900"
            >
              {slot}
            </Typography>
          </Pressable>
        ))}
        {isSubmitting && (
          <View className="absolute inset-0 items-center justify-center bg-white/60">
            <ActivityIndicator color={colors.neutral[500]} />
          </View>
        )}
      </View>
    );
  }

  const hourSlots = selectedHour ? (slotsByHour.get(selectedHour) ?? []) : [];

  if (selectedHour) {
    return (
      <View className="gap-3">
        <Pressable
          className="flex-row items-center gap-1 active:opacity-70 self-start"
          onPress={() => onSelectHour(null)}
        >
          <StSvg name="Expand_left" size={18} color={colors.neutral[500]} />
          <Typography className="text-caption text-neutral-500">
            {selectedHour}:00
          </Typography>
        </Pressable>

        <View className="flex-row flex-wrap gap-2">
          {hourSlots.map((slot) => (
            <Pressable
              key={slot}
              disabled={isSubmitting}
              onPress={() => onPick(slot)}
              className={SLOT_BTN_CLASS}
              style={SLOT_BTN_STYLE}
            >
              <Typography
                weight="semibold"
                className="text-body text-neutral-900"
              >
                {slot}
              </Typography>
            </Pressable>
          ))}
        </View>

        {isSubmitting && (
          <View className="absolute inset-0 items-center justify-center bg-white/60">
            <ActivityIndicator color={colors.neutral[500]} />
          </View>
        )}
      </View>
    );
  }

  return (
    <View className="flex-row flex-wrap gap-2">
      {Array.from(slotsByHour.keys()).map((hour) => (
        <Pressable
          key={hour}
          disabled={isSubmitting}
          onPress={() => onSelectHour(hour)}
          className={SLOT_BTN_CLASS}
          style={SLOT_BTN_STYLE}
        >
          <Typography weight="semibold" className="text-body text-neutral-900">
            {hour}:00
          </Typography>
        </Pressable>
      ))}
    </View>
  );
};

export default SlotPicker;
