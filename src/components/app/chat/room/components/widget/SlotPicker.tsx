import React from "react";
import { ActivityIndicator, Pressable, View } from "react-native";
import { Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import { useGetAvailableSlotsQuery } from "@/src/store/redux/services/api/appointmentsApi";

type Props = {
  userId: number;
  date: string;
  isSubmitting?: boolean;
  onPick: (startTime: string) => void;
};

const SlotPicker = ({ userId, date, isSubmitting, onPick }: Props) => {
  const { data: slots, isLoading } = useGetAvailableSlotsQuery({
    userId,
    date,
  });

  if (isLoading) {
    return (
      <View className="items-center py-6">
        <ActivityIndicator color={colors.neutral[400]} />
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

  return (
    <View className="flex-row flex-wrap gap-2">
      {slots.map((slot) => (
        <Pressable
          key={slot}
          disabled={isSubmitting}
          onPress={() => onPick(slot)}
          className="px-4 py-3 rounded-base bg-background-surface active:opacity-70"
          style={{ minWidth: 88, alignItems: "center" }}
        >
          <Typography weight="semibold" className="text-body text-neutral-900">
            {slot}
          </Typography>
        </Pressable>
      ))}
      {isSubmitting ? (
        <View className="absolute inset-0 items-center justify-center bg-white/60">
          <ActivityIndicator color={colors.neutral[500]} />
        </View>
      ) : null}
    </View>
  );
};

export default SlotPicker;
