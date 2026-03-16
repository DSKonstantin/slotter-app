import React from "react";
import type {
  Appointment,
  WorkingDayBreak,
} from "@/src/store/redux/services/api-types";
import { View, ScrollView } from "react-native";
import { router } from "expo-router";
import { Typography } from "@/src/components/ui";
import { TAB_BAR_HEIGHT } from "@/src/constants/tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import TimeSlotListSkeleton from "./TimeSlotListSkeleton";
import EmptySlots from "./EmptySlots";
import SlotCard from "@/src/components/shared/cards/scheduling/slotCard";
import BreakBlock from "./BreakBlock";
import FreeSlotBlock from "./FreeSlotBlock";
import { HOUR_HEIGHT, MINUTE_HEIGHT, SLOT_GAP } from "./constants";
import { parseTime, formatTime } from "./utils";
import { Routers } from "@/src/constants/routers";
import map from "lodash/map";

type TimeSlotListProps = {
  appointment: Appointment[];
  breaks?: WorkingDayBreak[];
  startAt?: string;
  endAt?: string;
  date?: string;
  workingDayId?: number;
  isLoading?: boolean;
};

type SegmentContent =
  | { kind: "break"; breakItem: WorkingDayBreak }
  | { kind: "slots"; zero: Appointment[]; normal: Appointment[] };

const TimeSlotList: React.FC<TimeSlotListProps> = ({
  appointment,
  breaks = [],
  startAt,
  endAt,
  date,
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
        style={{ marginBottom: TAB_BAR_HEIGHT + bottom + 80 }}
      >
        <Typography className="text-body text-neutral-400">
          На этот день записей нет
        </Typography>
      </View>
    );
  }

  const start = parseTime(startAt);
  const end = parseTime(endAt);
  const startHour = Math.floor(start / 60);
  const endHour = Math.ceil(end / 60);

  // Collect all time points: hour boundaries (skipping those inside breaks) + break boundaries
  const timePoints = new Set<number>();
  for (let h = startHour; h <= endHour; h++) {
    const hMin = h * 60;
    const insideBreak = breaks.some(
      (b) => parseTime(b.start_at) < hMin && parseTime(b.end_at) > hMin,
    );
    if (!insideBreak) timePoints.add(hMin);
  }
  breaks.forEach((b) => {
    timePoints.add(parseTime(b.start_at));
    timePoints.add(parseTime(b.end_at));
  });
  appointment.forEach((s) => {
    const t = parseTime(s.start_time);
    const e = t + s.duration;
    if (t >= start && t <= end) timePoints.add(t);
    if (e >= start && e <= end) timePoints.add(e);
  });
  const sorted = Array.from(timePoints).sort((a, b) => a - b);

  // Build segments between consecutive time points
  const segments = sorted.slice(0, -1).map((segStart, i) => {
    const segEnd = sorted[i + 1];
    const breakItem = breaks.find(
      (b) => parseTime(b.start_at) <= segStart && parseTime(b.end_at) >= segEnd,
    );
    const content: SegmentContent = breakItem
      ? { kind: "break", breakItem }
      : {
          kind: "slots",
          zero: appointment.filter(
            (s) =>
              parseTime(s.start_time) >= segStart &&
              parseTime(s.start_time) < segEnd &&
              s.duration === 0,
          ),
          normal: appointment.filter(
            (s) =>
              parseTime(s.start_time) >= segStart &&
              parseTime(s.start_time) < segEnd &&
              s.duration > 0,
          ),
        };
    return { segStart, segEnd, content };
  });

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      className="flex-1 pt-4 px-screen"
      contentContainerStyle={{ paddingBottom: TAB_BAR_HEIGHT + bottom + 80 }}
    >
      {map(segments, ({ segStart, segEnd, content }) => {
        const showLabel = segStart % 60 === 0;

        return (
          <View
            key={segStart}
            className="flex-row"
            style={{
              minHeight: HOUR_HEIGHT,
            }}
          >
            <View className="w-16 border-r border-neutral-200 pr-2">
              {showLabel && (
                <Typography className="text-sm text-gray-500">
                  {formatTime(segStart)}
                </Typography>
              )}
            </View>

            <View className="flex-1 pl-2.5">
              {content.kind === "break" ? (
                <BreakBlock breakItem={content.breakItem} />
              ) : (
                <>
                  {map(content.zero, (slot) => (
                    <SlotCard
                      key={slot.id}
                      slot={slot}
                      onPress={() =>
                        router.push(Routers.app.calendar.slot(slot.id))
                      }
                    />
                  ))}
                  {content.normal.length > 0 ? (
                    map(content.normal, (slot) => (
                      <SlotCard
                        key={slot.id}
                        slot={slot}
                        onPress={() =>
                          router.push(Routers.app.calendar.slot(slot.id))
                        }
                      />
                    ))
                  ) : (
                    <FreeSlotBlock
                      date={date}
                      time={formatTime(segStart)}
                      endTime={formatTime(segEnd)}
                    />
                  )}
                </>
              )}
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
};

export default TimeSlotList;
