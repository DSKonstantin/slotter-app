import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
} from "react";
import type {
  Appointment,
  WorkingDayBreak,
} from "@/src/store/redux/services/api-types";
import { View, Dimensions } from "react-native";
import { router } from "expo-router";
import SlotCard from "@/src/components/shared/cards/scheduling/slotCard";
import BreakBlock from "./BreakBlock";
import FreeSlotBlock from "./FreeSlotBlock";
import FilteredSlotBlock from "./FilteredSlotBlock";
import TimeLabels from "./TimeLabels";
import { MINUTE_HEIGHT, SLOT_GAP } from "./constants";
import { parseTime, formatTime } from "./utils";
import { Routers } from "@/src/constants/routers";
import { useAppDispatch, useAppSelector } from "@/src/store/redux/store";
import {
  clearHighlightSlotId,
  selectActiveStatuses,
} from "@/src/store/redux/slices/calendarSlice";
import {
  createSegments,
  getSegmentHeight,
  getSlotMinHeight,
  slotOccupiesTime,
} from "./segmentBuilder";
import CurrentTimeIndicator from "@/src/components/app/calendar/home/day/timeSlotList/CurrentTimeIndicator";
import { isCurrentDay } from "@/src/utils/date/formatDate";

type TimeSlotListProps = {
  appointments: Appointment[];
  breaks?: WorkingDayBreak[];
  workingDayId?: number;
  startAt?: string;
  endAt?: string;
  date?: string;
  onHighlightScroll?: (y: number) => void;
};

const TimeSlotListBase: React.FC<TimeSlotListProps> = ({
  appointments,
  breaks = [],
  workingDayId,
  startAt,
  endAt,
  date,
  onHighlightScroll,
}) => {
  const now = new Date();
  const isToday = isCurrentDay(date);
  const hasScrolledRef = useRef(false);
  const dispatch = useAppDispatch();
  const visibleStatuses = useAppSelector(selectActiveStatuses);
  const highlightSlotId = useAppSelector(
    (state) => state.calendar.highlightSlotId,
  );

  const [expandedSlotId, setExpandedSlotId] = useState<number | null>(null);

  const handleSlotPress = useCallback((id: number) => {
    router.push(Routers.app.calendar.slot(id));
  }, []);

  const handleToggleExpand = useCallback((id: number) => {
    setExpandedSlotId((prev) => (prev === id ? null : id));
  }, []);

  const segmentsResult = useMemo(
    () => createSegments(startAt, endAt, breaks, appointments, visibleStatuses),
    [appointments, visibleStatuses, breaks, startAt, endAt],
  );
  const segments = segmentsResult.segments;
  const effectiveStart = segmentsResult.effectiveStart;

  const scrollKey = useMemo(() => {
    return JSON.stringify([
      date,
      startAt,
      endAt,
      appointments
        .map((a) => `${a.id}-${a.start_time}-${a.end_time}`)
        .join("|"),
      visibleStatuses.join("|"),
    ]);
  }, [date, startAt, endAt, appointments, visibleStatuses]);

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const currentTime = formatTime(currentMinutes);

  const timelineEnd = parseTime(endAt ?? "23:59");

  const nowOffset = useMemo(() => {
    let y = 0;

    for (const seg of segments) {
      const start = seg.segStart;
      const end = seg.segEnd;

      if (currentMinutes >= start && currentMinutes < end) {
        y += (currentMinutes - start) * MINUTE_HEIGHT;
        return y;
      }

      y += getSegmentHeight(seg);
    }

    return y;
  }, [segments, currentMinutes]);

  const isNowInRange =
    currentMinutes >= effectiveStart && currentMinutes <= timelineEnd;

  const targetScrollY = useMemo(() => {
    if (highlightSlotId) {
      const slot = appointments.find((a) => a.id === highlightSlotId);

      if (!slot) {
        return null;
      }

      return Math.max(
        0,
        (parseTime(slot.start_time) - effectiveStart) * MINUTE_HEIGHT - 50,
      );
    }

    if (isToday && isNowInRange) {
      const screenHeight = Dimensions.get("window").height;

      return Math.max(0, nowOffset - screenHeight / 2);
    }

    return null;
  }, [
    highlightSlotId,
    isToday,
    isNowInRange,
    appointments,
    effectiveStart,
    nowOffset,
  ]);

  useEffect(() => {
    if (targetScrollY == null) {
      return;
    }

    if (hasScrolledRef.current) {
      return;
    }

    const frame = requestAnimationFrame(() => {
      onHighlightScroll?.(targetScrollY);

      hasScrolledRef.current = true;
    });

    return () => cancelAnimationFrame(frame);
  }, [targetScrollY, onHighlightScroll]);

  useEffect(() => {
    hasScrolledRef.current = false;
  }, [scrollKey]);

  useEffect(() => {
    if (!highlightSlotId) {
      return;
    }

    const timer = setTimeout(() => {
      dispatch(clearHighlightSlotId());
    }, 3000);

    return () => clearTimeout(timer);
  }, [highlightSlotId, dispatch]);

  if (segments.length === 0) return null;

  return (
    <View className="flex-1 pt-4 px-screen relative">
      {isToday && isNowInRange && (
        <CurrentTimeIndicator top={nowOffset + 16} time={currentTime} />
      )}
      {segments.map((segment) => {
        const { segStart, segEnd, isCompressed, content } = segment;
        return (
          <View
            key={segStart}
            className="flex-row"
            style={{ height: getSegmentHeight(segment) }}
          >
            <View className="border-r border-neutral-200 relative w-[50px]">
              {!isCompressed && (
                <TimeLabels segStart={segStart} segEnd={segEnd} />
              )}
            </View>

            <View className="flex-1 pl-2.5 relative">
              {content.kind === "break" ? (
                <BreakBlock
                  breakItem={content.breakItem}
                  workingDayId={workingDayId}
                />
              ) : (
                <>
                  {content.slots.map((slot) => (
                    <SlotCard
                      key={slot.id}
                      slot={slot}
                      onPress={() => handleSlotPress(slot.id)}
                      highlighted={slot.id === highlightSlotId}
                      isExpanded={slot.id === expandedSlotId}
                      onToggleExpand={() => handleToggleExpand(slot.id)}
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
        );
      })}
    </View>
  );
};

const TimeSlotList = memo(TimeSlotListBase);

export default TimeSlotList;
