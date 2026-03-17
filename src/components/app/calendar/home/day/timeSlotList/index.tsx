import React, { memo, useCallback, useMemo } from "react";
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
import SlotCard from "@/src/components/shared/cards/scheduling/slotCard";
import BreakBlock from "./BreakBlock";
import FreeSlotBlock from "./FreeSlotBlock";
import { HOUR_HEIGHT, MINUTE_HEIGHT } from "./constants";
import { parseTime, formatTime } from "./utils";
import { Routers } from "@/src/constants/routers";

interface TimeLabelsProps {
  segStart: number;
  segEnd: number;
}

const TimeLabels = ({ segStart, segEnd }: TimeLabelsProps) => {
  const firstHour = Math.ceil(segStart / 60);
  const lastHour = Math.floor(segEnd / 60);

  return (
    <>
      {Array.from(
        { length: lastHour - firstHour + 1 },
        (_, i) => (firstHour + i) * 60,
      )
        .filter((hMin) => hMin >= segStart && hMin < segEnd)
        .map((hMin) => (
          <Typography
            key={hMin}
            className="text-caption text-gray-500 absolute"
            style={{
              top: (hMin - segStart) * MINUTE_HEIGHT,
            }}
          >
            {formatTime(hMin)}
          </Typography>
        ))}
    </>
  );
};

const HalfHourLines = ({ segStart, segEnd }: TimeLabelsProps) => {
  const firstHalf = Math.ceil(segStart / 30);
  const lastHalf = Math.floor(segEnd / 30);

  return (
    <>
      {Array.from(
        { length: lastHalf - firstHalf + 1 },
        (_, i) => (firstHalf + i) * 30,
      )
        .filter((hMin) => hMin % 60 !== 0 && hMin >= segStart && hMin < segEnd)
        .map((hMin) => (
          <View
            key={hMin}
            className="absolute right-0 h-0 border-b border-dashed border-neutral-200"
            style={{
              top: (hMin - segStart) * MINUTE_HEIGHT,
              left: -49,
            }}
          />
        ))}
    </>
  );
};

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
  | { kind: "slots"; slots: Appointment[] };

const TimeSlotListBase: React.FC<TimeSlotListProps> = ({
  appointment,
  breaks = [],
  startAt,
  endAt,
  date,
  isLoading,
}) => {
  const { bottom } = useSafeAreaInsets();

  const handleSlotPress = useCallback((id: number) => {
    router.push(Routers.app.calendar.slot(id));
  }, []);

  const segments = useMemo(() => {
    if (!startAt || !endAt) return null;

    const start = parseTime(startAt);
    const end = parseTime(endAt);

    const parsedBreaks = breaks.map((b) => ({
      start: parseTime(b.start_at),
      end: parseTime(b.end_at),
      breakItem: b,
    }));

    const parsedAppointments = appointment.map((s) => ({
      start: parseTime(s.start_time),
      slot: s,
    }));

    const timePoints = new Set<number>();

    // Always bound the grid to the working day
    timePoints.add(start);
    timePoints.add(end);

    // Only add whole-hour boundaries strictly within the working day
    const startHour = Math.ceil(start / 60);
    const endHour = Math.floor(end / 60);

    for (let h = startHour; h <= endHour; h++) {
      const hMin = h * 60;
      const insideBreak = parsedBreaks.some(
        (b) => b.start < hMin && b.end > hMin,
      );
      const insideAppointment = parsedAppointments.some(
        ({ start: t, slot }) =>
          slot.duration > 0 && t < hMin && t + slot.duration > hMin,
      );
      if (!insideBreak && !insideAppointment) timePoints.add(hMin);
    }

    parsedBreaks.forEach((b) => {
      timePoints.add(b.start);
      timePoints.add(b.end);
    });

    parsedAppointments.forEach(({ start: t, slot }) => {
      const e = t + slot.duration;
      const isInsideLongerAppointment =
        slot.duration === 0 &&
        parsedAppointments.some(
          (other) =>
            other.slot.duration > 0 &&
            other.start < t &&
            other.start + other.slot.duration > t,
        );
      if (!isInsideLongerAppointment && t >= start && t <= end)
        timePoints.add(t);
      if (e > start && e <= end) timePoints.add(e);
    });

    const sorted = Array.from(timePoints).sort((a, b) => a - b);

    return sorted.slice(0, -1).map((segStart, i) => {
      const segEnd = sorted[i + 1];
      const breakItem = parsedBreaks.find(
        (b) => b.start <= segStart && b.end >= segEnd,
      );

      const content: SegmentContent = breakItem
        ? { kind: "break", breakItem: breakItem.breakItem }
        : {
            kind: "slots",
            slots: parsedAppointments
              .filter(({ start: t }) => t >= segStart && t < segEnd)
              .map(({ slot }) => slot),
          };

      return { segStart, segEnd, content };
    });
  }, [appointment, breaks, startAt, endAt]);

  if (isLoading) {
    return <TimeSlotListSkeleton />;
  }

  if (!segments) {
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

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      className="flex-1 pt-4 px-screen"
      contentContainerStyle={{ paddingBottom: TAB_BAR_HEIGHT + bottom + 80 }}
    >
      {segments.map(({ segStart, segEnd, content }) => (
        <View
          key={segStart}
          className="flex-row"
          style={{
            height: (() => {
              const base = (segEnd - segStart) * MINUTE_HEIGHT;
              if (content.kind !== "slots") return base;
              if (content.slots.length > 0) return Math.max(base, HOUR_HEIGHT);
              return Math.max(base, 40);
            })(),
          }}
        >
          <View className="border-r border-neutral-200 relative w-[50px]">
            <TimeLabels segStart={segStart} segEnd={segEnd} />
          </View>

          <View className="flex-1 pl-2.5 relative">
            {content.kind === "slots" && content.slots.length === 0 && (
              <HalfHourLines segStart={segStart} segEnd={segEnd} />
            )}
            {content.kind === "break" ? (
              <BreakBlock breakItem={content.breakItem} />
            ) : content.slots.length > 0 ? (
              content.slots.map((slot) => (
                <SlotCard
                  key={slot.id}
                  slot={slot}
                  onPress={() => handleSlotPress(slot.id)}
                />
              ))
            ) : (
              <FreeSlotBlock
                date={date}
                time={formatTime(segStart)}
                endTime={formatTime(segEnd)}
              />
            )}
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

const TimeSlotList = memo(TimeSlotListBase);

export default TimeSlotList;
