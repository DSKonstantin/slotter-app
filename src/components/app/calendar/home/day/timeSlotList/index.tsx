import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
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
  userId?: number;
  startAt?: string;
  endAt?: string;
  date?: string;
  isActive?: boolean;
  onHighlightScroll?: (y: number) => void;
};

const PADDING_TOP = 16;

function computeNowOffset(
  segments: ReturnType<typeof createSegments>["segments"],
  currentMinutes: number,
): number {
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
}

type AutoCurrentTimeIndicatorProps = {
  segments: ReturnType<typeof createSegments>["segments"];
  effectiveStart: number;
  timelineEnd: number;
  paddingTop: number;
};

const AutoCurrentTimeIndicator = memo(function AutoCurrentTimeIndicator({
  segments,
  effectiveStart,
  timelineEnd,
  paddingTop,
}: AutoCurrentTimeIndicatorProps) {
  const [currentMinutes, setCurrentMinutes] = useState(() => {
    const d = new Date();
    return d.getHours() * 60 + d.getMinutes();
  });

  const nowOffset = useMemo(() => {
    if (currentMinutes < effectiveStart) return 0;
    if (currentMinutes > timelineEnd)
      return segments.reduce((acc, seg) => acc + getSegmentHeight(seg), 0);
    return computeNowOffset(segments, currentMinutes);
  }, [segments, currentMinutes, effectiveStart, timelineEnd]);

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setCurrentMinutes(d.getHours() * 60 + d.getMinutes());
    };

    const now = new Date();
    const msToNext = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();

    let interval: ReturnType<typeof setInterval>;
    const timeout = setTimeout(() => {
      tick();
      interval = setInterval(tick, 60_000);
    }, msToNext);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, []);

  return (
    <CurrentTimeIndicator
      top={nowOffset + paddingTop}
      time={formatTime(currentMinutes)}
    />
  );
});

const TimeSlotListBase: React.FC<TimeSlotListProps> = ({
  appointments,
  breaks = [],
  workingDayId,
  userId,
  startAt,
  endAt,
  date,
  isActive,
  onHighlightScroll,
}) => {
  const isToday = isCurrentDay(date);
  const [expandedSlotId, setExpandedSlotId] = useState<number | null>(null);
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const onHighlightScrollRef = useRef(onHighlightScroll);

  const dispatch = useAppDispatch();
  const visibleStatuses = useAppSelector(selectActiveStatuses);
  const highlightSlotId = useAppSelector(
    (state) => state.calendar.highlightSlotId,
  );

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

  const timelineEnd = parseTime(endAt ?? "23:59");

  const nowOffset = useMemo(
    () => computeNowOffset(segments, currentMinutes),
    [segments, currentMinutes],
  );

  const isNowInRange =
    currentMinutes >= effectiveStart && currentMinutes <= timelineEnd;

  const handleSlotPress = useCallback((id: number) => {
    router.push(Routers.app.calendar.slot(id));
  }, []);

  const handleToggleExpand = useCallback((id: number) => {
    setExpandedSlotId((prev) => (prev === id ? null : id));
  }, []);

  const computeTargetScrollY = useCallback(() => {
    if (highlightSlotId) {
      const slot = appointments.find((a) => a.id === highlightSlotId);
      if (!slot) return null;
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
    appointments,
    effectiveStart,
    isToday,
    isNowInRange,
    nowOffset,
  ]);

  useEffect(() => {
    const y = computeTargetScrollY();
    if (y == null) return;

    const frame = requestAnimationFrame(() => {
      onHighlightScrollRef.current?.(y);
    });

    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  useEffect(() => {
    onHighlightScrollRef.current = onHighlightScroll;
  });

  if (segments.length === 0) return null;

  return (
    <View
      className="flex-1 px-screen relative"
      style={{ paddingTop: PADDING_TOP }}
    >
      {isToday && (
        <AutoCurrentTimeIndicator
          segments={segments}
          effectiveStart={effectiveStart}
          timelineEnd={timelineEnd}
          paddingTop={PADDING_TOP}
        />
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
                      isActive={isActive}
                      workingDayId={workingDayId}
                      userId={userId}
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
