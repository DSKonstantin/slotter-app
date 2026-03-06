import React from "react";
import { View, ScrollView } from "react-native";
import { Typography } from "@/src/components/ui";
import { TAB_BAR_HEIGHT } from "@/src/constants/tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import TimeSlotListSkeleton from "./TimeSlotListSkeleton";
import HourRow from "./HourRow";
import { parseTime } from "./utils";

type TimeSlotListProps = {
  schedule: Schedule[];
  startAt?: string;
  endAt?: string;
  isLoading?: boolean;
};

const TimeSlotList: React.FC<TimeSlotListProps> = ({
  schedule,
  startAt,
  endAt,
  isLoading,
}) => {
  const { bottom } = useSafeAreaInsets();

  if (isLoading) {
    return <TimeSlotListSkeleton />;
  }

  if (!startAt || !endAt) {
    return (
      <View
        className="flex-1 items-center justify-center"
        style={{ marginBottom: TAB_BAR_HEIGHT + bottom + 74 }}
      >
        <Typography className="text-body text-neutral-400">
          Записей на этот день нет
        </Typography>
      </View>
    );
  }

  const start = parseTime(startAt);
  const end = parseTime(endAt);
  const startHour = Math.floor(start / 60);
  const endHour = Math.ceil(end / 60);
  const hourMarkers = Array.from(
    { length: endHour - startHour + 1 },
    (_, i) => (startHour + i) * 60,
  );

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      className="flex-1 pt-4 px-screen"
      contentContainerStyle={{ paddingBottom: TAB_BAR_HEIGHT + bottom + 74 }}
    >
      {hourMarkers.map((hourMin) => (
        <HourRow key={hourMin} hourMin={hourMin} schedule={schedule} />
      ))}
    </ScrollView>
  );
};

export default TimeSlotList;
