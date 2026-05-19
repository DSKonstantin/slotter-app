import React, { useMemo } from "react";
import { ActivityIndicator, Pressable, View } from "react-native";
import { StSvg, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import { useGetAvailableSlotsQuery } from "@/src/store/redux/services/api/appointmentsApi";
import RetryInline from "@/src/components/shared/retryInline";
import { useAppSelector } from "@/src/store/redux/store";
import { appointmentStepToMinutes } from "@/src/utils/schedule/appointmentStepToMinutes";

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
  const appointmentStep = useAppSelector((s) => s.auth.user?.appointment_step);
  const stepMinutes = appointmentStep
    ? appointmentStepToMinutes(appointmentStep)
    : 60;
  const useHourGrouping = stepMinutes < 60;

  const {
    data: slots,
    isLoading,
    isError,
    refetch,
  } = useGetAvailableSlotsQuery({ userId, date, step: stepMinutes });

  const slotsByHour = useMemo(() => {
    const map = new Map<string, string[]>();
    if (!slots) return map;
    for (const slot of slots) {
      const hour = slot.split(":")[0];
      if (!map.has(hour)) map.set(hour, []);
      map.get(hour)!.push(slot);
    }
    return map;
  }, [slots]);

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
