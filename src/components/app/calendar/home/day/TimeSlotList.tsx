import type { Schedule } from "@/src/store/redux/slices/calendarSlice";
import React, { useMemo } from "react";
import { View, ScrollView } from "react-native";
import { Divider, Typography } from "@/src/components/ui";
import { TAB_BAR_HEIGHT } from "@/src/constants/tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import SlotCard from "@/src/components/shared/cards/scheduling/slotCard";

const HOUR_HEIGHT = 64;
const MINUTE_HEIGHT = HOUR_HEIGHT / 60;
const START_HOUR = 9;
const END_HOUR = 17;

const parseTime = (isoTime: string) => {
  const date = new Date(isoTime);
  return date.getUTCHours() * 60 + date.getUTCMinutes();
};

const formatTime = (minutes: number) => {
  const hours = Math.floor(minutes / 60)
    .toString()
    .padStart(2, "0");
  const mins = (minutes % 60).toString().padStart(2, "0");
  return `${hours}:${mins}`;
};

type TimeSlotListProps = {
  schedule: Schedule[];
};

const TimeSlotList: React.FC<TimeSlotListProps> = ({ schedule }) => {
  const { bottom } = useSafeAreaInsets();

  const gridTimePoints = useMemo(() => {
    const timePoints = new Set<number>();

    // Add hourly markers
    for (let hour = START_HOUR; hour <= END_HOUR; hour++) {
      timePoints.add(hour * 60);
    }

    // Add schedule start and end times
    schedule.forEach((slot) => {
      timePoints.add(parseTime(slot.timeStart));
      timePoints.add(parseTime(slot.timeEnd));
    });

    return Array.from(timePoints).sort((a, b) => a - b);
  }, [schedule]);

  const renderDynamicGrid = () => {
    return gridTimePoints.slice(0, -1).map((time, index) => {
      const nextTime = gridTimePoints[index + 1];
      const height = (nextTime - time) * MINUTE_HEIGHT;

      return (
        <View
          key={time}
          style={{ height }}
          className="relative justify-start items-start"
        >
          <Divider className="absolute left-0 right-0 bottom-0" />
          <Typography className="text-sm text-gray-500 -top-2">
            {formatTime(time)}
          </Typography>
        </View>
      );
    });
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      className="flex-1 pt-4 px-screen"
      contentContainerStyle={{
        paddingBottom: TAB_BAR_HEIGHT + bottom + 74,
      }}
    >
      <View className="flex-row items-start">
        <View className="w-16 h-full border-r border-neutral-200 pr-2">
          {renderDynamicGrid()}
        </View>

        <View className="flex-1 relative">
          {schedule.map((slot) => {
            const top =
              (parseTime(slot.timeStart) - START_HOUR * 60) * MINUTE_HEIGHT;
            const height =
              (parseTime(slot.timeEnd) - parseTime(slot.timeStart)) *
              MINUTE_HEIGHT;

            return (
              <View
                key={slot.id}
                style={{
                  position: "absolute",
                  top,
                  height,
                  left: 10,
                  right: 0,
                }}
              >
                <SlotCard slot={slot} />
              </View>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
};

export default TimeSlotList;
