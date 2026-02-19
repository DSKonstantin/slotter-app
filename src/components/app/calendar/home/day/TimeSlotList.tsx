import type { Schedule } from "@/src/store/redux/slices/calendarSlice";
import React, { useMemo } from "react";
import { View, ScrollView } from "react-native";
import { Divider, Typography } from "@/src/components/ui";
import { TAB_BAR_HEIGHT } from "@/src/constants/tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import SlotCard from "@/src/components/shared/cards/scheduling/slotCard";

const HOUR_HEIGHT = 120;
const MINUTE_HEIGHT = HOUR_HEIGHT / 60;
const START_HOUR = 9;
const END_HOUR = 17;
const START_MINUTES = START_HOUR * 60;
const END_MINUTES = END_HOUR * 60;
const HOUR_MARKERS = Array.from(
  { length: END_HOUR - START_HOUR + 1 },
  (_, index) => (START_HOUR + index) * 60,
);

const SLOT_GAP_PX = 2;

const parseTime = (isoTime: string) => {
  const date = new Date(isoTime);
  if (Number.isNaN(date.getTime())) return 0;
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

type SlotLayout = {
  slot: Schedule;
  top: number;
  height: number;
};

const TimeSlotList: React.FC<TimeSlotListProps> = ({ schedule }) => {
  const { bottom } = useSafeAreaInsets();

  const { slotsLayout, timelineHeight } = useMemo(() => {
    const layouts: SlotLayout[] = [];
    let maxBottom = (END_MINUTES - START_MINUTES) * MINUTE_HEIGHT;

    schedule.forEach((slot) => {
      const start = parseTime(slot.timeStart);
      const end = parseTime(slot.timeEnd);
      const duration = end - start;
      if (duration <= 0) return;

      const top = (start - START_MINUTES) * MINUTE_HEIGHT;
      const effectiveHeight = Math.max(
        SLOT_GAP_PX,
        duration * MINUTE_HEIGHT - SLOT_GAP_PX,
      );

      layouts.push({ slot, top, height: effectiveHeight });
      maxBottom = Math.max(maxBottom, top + effectiveHeight);
    });

    return {
      slotsLayout: layouts,
      timelineHeight: maxBottom,
    };
  }, [schedule]);

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      className="flex-1 pt-4 px-screen"
      contentContainerStyle={{
        paddingBottom: TAB_BAR_HEIGHT + bottom + 74,
      }}
    >
      <View
        className="flex-row items-start"
        style={{ minHeight: timelineHeight }}
      >
        <View
          className="w-16 border-r border-neutral-200 pr-2 relative"
          style={{ height: timelineHeight }}
        >
          {HOUR_MARKERS.map((time) => (
            <View
              key={time}
              style={{ top: (time - START_MINUTES) * MINUTE_HEIGHT }}
              className="absolute left-0 right-0"
            >
              <Typography className="text-sm text-gray-500 -top-2.5">
                {formatTime(time)}
              </Typography>
              {/*<Divider className="absolute top-0" />*/}
            </View>
          ))}
        </View>

        <View className="flex-1 relative" style={{ height: timelineHeight }}>
          {slotsLayout.map(({ slot, top, height }, index) => (
            <View
              key={slot.id}
              style={{
                position: "absolute",
                top,
                height,
                left: 10,
                right: 0,
                // zIndex: slotsLayout.length - index,
              }}
            >
              <SlotCard slot={slot} />
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

export default TimeSlotList;
