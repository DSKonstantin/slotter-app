import type { Schedule } from "@/src/store/redux/slices/calendarSlice";
import React, { useMemo } from "react";
import { View, ScrollView } from "react-native";
import { Typography } from "@/src/components/ui";
import { TAB_BAR_HEIGHT } from "@/src/constants/tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import SlotCard from "@/src/components/shared/cards/scheduling/slotCard";

const HOUR_HEIGHT = 120;
const MINUTE_HEIGHT = HOUR_HEIGHT / 60;
const DEFAULT_START_MINUTES = 9 * 60;
const DEFAULT_END_MINUTES = 17 * 60;
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

  const { startMinutes, hourMarkers, slotsLayout, timelineHeight } =
    useMemo(() => {
      const starts = schedule
        .map((s) => parseTime(s.timeStart))
        .filter(Boolean);
      const ends = schedule.map((s) => parseTime(s.timeEnd)).filter(Boolean);

      const start = starts.length ? Math.min(...starts) : DEFAULT_START_MINUTES;
      const end = ends.length ? Math.max(...ends) : DEFAULT_END_MINUTES;

      const startHour = Math.floor(start / 60);
      const endHour = Math.ceil(end / 60);
      const markers = Array.from(
        { length: endHour - startHour + 1 },
        (_, i) => (startHour + i) * 60,
      );

      const layouts: SlotLayout[] = [];
      let maxBottom = (end - start) * MINUTE_HEIGHT;

      schedule.forEach((slot) => {
        const slotStart = parseTime(slot.timeStart);
        const slotEnd = parseTime(slot.timeEnd);
        const duration = slotEnd - slotStart;
        if (duration <= 0) return;

        const top = (slotStart - start) * MINUTE_HEIGHT;
        const effectiveHeight = Math.max(
          SLOT_GAP_PX,
          duration * MINUTE_HEIGHT - SLOT_GAP_PX,
        );

        layouts.push({ slot, top, height: effectiveHeight });
        maxBottom = Math.max(maxBottom, top + effectiveHeight);
      });

      return {
        startMinutes: start,
        hourMarkers: markers,
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
          {hourMarkers.map((time) => (
            <View
              key={time}
              style={{ top: (time - startMinutes) * MINUTE_HEIGHT }}
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
