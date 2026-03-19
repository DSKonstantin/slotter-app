import React, { memo, useCallback, useMemo } from "react";
import type {
  Appointment,
  AppointmentStatus,
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
import FilteredSlotBlock from "./FilteredSlotBlock";
import {
  LONG_SLOT_MIN_HEIGHT,
  MINUTE_HEIGHT,
  SHORT_SLOT_MIN_HEIGHT,
  SLOT_GAP,
} from "./constants";
import { parseTime, formatTime } from "./utils";
import { Routers } from "@/src/constants/routers";
import { useAppSelector } from "@/src/store/redux/store";
import { selectActiveStatuses } from "@/src/store/redux/slices/calendarSlice";

interface TimeLabelsProps {
  segStart: number;
  segEnd: number;
}

type TimeSlotListProps = {
  appointment: Appointment[];
  breaks?: WorkingDayBreak[];
  startAt?: string;
  endAt?: string;
  date?: string;
  workingDayId?: number;
  isLoading?: boolean;
};

type ParsedBreak = {
  start: number;
  end: number;
  breakItem: WorkingDayBreak;
};

type ParsedAppointment = {
  start: number;
  end: number;
  slot: Appointment;
  blocksTime: boolean;
  isVisible: boolean;
};

type SegmentContent =
  | { kind: "break"; breakItem: WorkingDayBreak }
  | {
      kind: "slots";
      slots: Appointment[];
      showFreeSlotBlock: boolean;
      showFilteredBlock: boolean;
      filteredBlockMinHeight: number;
    };

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

const getSlotMinHeight = (slot: Appointment) =>
  slot.duration > 29 ? LONG_SLOT_MIN_HEIGHT : SHORT_SLOT_MIN_HEIGHT;

const slotOccupiesTime = (slot: Appointment) =>
  slot.status !== "cancelled" && slot.duration > 0;

const occupiesTime = ({ blocksTime, slot }: ParsedAppointment) =>
  blocksTime && slot.duration > 0;

const parseBreaks = (breaks: WorkingDayBreak[]): ParsedBreak[] =>
  breaks.map((breakItem) => ({
    start: parseTime(breakItem.start_at),
    end: parseTime(breakItem.end_at),
    breakItem,
  }));

const parseAppointments = (
  appointments: Appointment[],
  visibleStatuses: AppointmentStatus[],
): ParsedAppointment[] => {
  const visibleStatusesSet = new Set(visibleStatuses);

  return appointments.map((slot) => {
    const start = parseTime(slot.start_time);

    return {
      start,
      end: start + slot.duration,
      slot,
      blocksTime: slot.status !== "cancelled",
      isVisible: visibleStatusesSet.has(slot.status),
    };
  });
};

const collectTimePoints = (
  dayStart: number,
  dayEnd: number,
  parsedBreaks: ParsedBreak[],
  blockingAppointments: ParsedAppointment[],
) => {
  const timePoints = new Set<number>([dayStart, dayEnd]);
  const startHour = Math.ceil(dayStart / 60);
  const endHour = Math.floor(dayEnd / 60);

  for (let hour = startHour; hour <= endHour; hour++) {
    const hourMinute = hour * 60;
    const insideBreak = parsedBreaks.some(
      (breakItem) => breakItem.start < hourMinute && breakItem.end > hourMinute,
    );
    const insideAppointment = blockingAppointments.some(
      ({ start, end, slot }) =>
        slot.duration > 0 && start < hourMinute && end > hourMinute,
    );

    if (!insideBreak && !insideAppointment) {
      timePoints.add(hourMinute);
    }
  }

  parsedBreaks.forEach((breakItem) => {
    timePoints.add(breakItem.start);
    timePoints.add(breakItem.end);
  });

  blockingAppointments.forEach((appointment) => {
    const isInsideLongerAppointment =
      appointment.slot.duration === 0 &&
      blockingAppointments.some(
        (other) =>
          other.slot.duration > 0 &&
          other.start < appointment.start &&
          other.end > appointment.start,
      );

    if (
      !isInsideLongerAppointment &&
      appointment.start >= dayStart &&
      appointment.start <= dayEnd
    ) {
      timePoints.add(appointment.start);
    }

    if (appointment.end > dayStart && appointment.end <= dayEnd) {
      timePoints.add(appointment.end);
    }
  });

  return Array.from(timePoints).sort((a, b) => a - b);
};

const buildSegments = (
  timePoints: number[],
  parsedBreaks: ParsedBreak[],
  parsedAppointments: ParsedAppointment[],
) =>
  timePoints.slice(0, -1).map((segStart, index) => {
    const segEnd = timePoints[index + 1];
    const breakItem = parsedBreaks.find(
      (parsedBreak) =>
        parsedBreak.start <= segStart && parsedBreak.end >= segEnd,
    );

    if (breakItem) {
      return {
        segStart,
        segEnd,
        content: { kind: "break", breakItem: breakItem.breakItem } as const,
      };
    }

    const segmentAppointments = parsedAppointments
      .filter(({ start }) => start >= segStart && start < segEnd)
      .sort((a, b) => a.start - b.start);
    const visibleAppointments = segmentAppointments.filter(
      ({ isVisible }) => isVisible,
    );
    const hiddenOccupiedAppointments = segmentAppointments.filter(
      (appointment) => !appointment.isVisible && occupiesTime(appointment),
    );

    return {
      segStart,
      segEnd,
      content: {
        kind: "slots",
        slots: visibleAppointments.map(({ slot }) => slot),
        showFreeSlotBlock: !segmentAppointments.some(occupiesTime),
        showFilteredBlock:
          hiddenOccupiedAppointments.length > 0 &&
          visibleAppointments.length === 0,
        filteredBlockMinHeight:
          hiddenOccupiedAppointments.reduce(
            (total, appointment) => total + getSlotMinHeight(appointment.slot),
            0,
          ) +
          SLOT_GAP * Math.max(0, hiddenOccupiedAppointments.length - 1),
      } as const,
    };
  });

const getSegmentHeight = (
  segStart: number,
  segEnd: number,
  content: SegmentContent,
) => {
  const baseGridHeight = (segEnd - segStart) * MINUTE_HEIGHT;

  if (content.kind === "break") return baseGridHeight;
  const slotsMinHeight =
    content.slots.reduce((total, slot) => total + getSlotMinHeight(slot), 0) +
    SLOT_GAP * content.slots.length;
  const freeSlotHeight = content.showFreeSlotBlock ? LONG_SLOT_MIN_HEIGHT : 0;
  const filteredBlockHeight = content.showFilteredBlock
    ? Math.max(SHORT_SLOT_MIN_HEIGHT, content.filteredBlockMinHeight)
    : 0;

  return Math.max(
    baseGridHeight,
    slotsMinHeight + freeSlotHeight + filteredBlockHeight,
  );
};

const TimeSlotListBase: React.FC<TimeSlotListProps> = ({
  appointment,
  breaks = [],
  startAt,
  endAt,
  date,
  isLoading,
}) => {
  const { bottom } = useSafeAreaInsets();
  const visibleStatuses = useAppSelector(selectActiveStatuses);

  const handleSlotPress = useCallback((id: number) => {
    router.push(Routers.app.calendar.slot(id));
  }, []);

  const segments = useMemo(() => {
    if (!startAt || !endAt) return null;

    const dayStart = parseTime(startAt);
    const dayEnd = parseTime(endAt);
    const parsedBreaks = parseBreaks(breaks);
    const parsedAppointments = parseAppointments(appointment, visibleStatuses);
    const blockingAppointments = parsedAppointments.filter(
      ({ blocksTime }) => blocksTime,
    );
    const timePoints = collectTimePoints(
      dayStart,
      dayEnd,
      parsedBreaks,
      blockingAppointments,
    );

    return buildSegments(timePoints, parsedBreaks, parsedAppointments);
  }, [appointment, visibleStatuses, breaks, startAt, endAt]);

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
            height: getSegmentHeight(segStart, segEnd, content),
          }}
        >
          <View className="border-r border-neutral-200 relative w-[50px]">
            <TimeLabels segStart={segStart} segEnd={segEnd} />
          </View>

          <View className="flex-1 pl-2.5 relative">
            {content.kind === "break" ? (
              <BreakBlock breakItem={content.breakItem} />
            ) : (
              <>
                {content.slots.map((slot) => (
                  <SlotCard
                    key={slot.id}
                    slot={slot}
                    onPress={() => handleSlotPress(slot.id)}
                    containerStyle={{
                      ...(slotOccupiesTime(slot) ? { flex: 1 } : null),
                      minHeight: getSlotMinHeight(slot),
                      marginBottom: SLOT_GAP,
                    }}
                  />
                ))}
                {content.showFilteredBlock && <FilteredSlotBlock />}
                {content.showFreeSlotBlock && (
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
      ))}
    </ScrollView>
  );
};

const TimeSlotList = memo(TimeSlotListBase);

export default TimeSlotList;
