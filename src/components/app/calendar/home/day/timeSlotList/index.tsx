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
import SegmentGridMarks from "./SegmentGridMarks";
import BreakBlock from "./BreakBlock";
import FilteredSlotBlock from "./FilteredSlotBlock";
import FreeSlotPressable from "./FreeSlotPressable";
import FreeSlotStartModal, { type FreeSlotRange } from "./FreeSlotStartModal";
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

function computeNowOffset(
  segments: ReturnType<typeof createSegments>["segments"],
  currentMinutes: number,
): number {
  let y = 0;
  for (const seg of segments) {
    const { segStart, segEnd, content } = seg;
    if (currentMinutes >= segStart && currentMinutes < segEnd) {
      const nonOccupying =
        content.kind === "slots"
          ? content.slots.filter((s) => !slotOccupiesTime(s))
          : [];
      const cancelledOffset =
        content.kind === "slots"
          ? SLOT_GAP +
            nonOccupying.reduce((h, s) => h + getSlotMinHeight(s), 0) +
            SLOT_GAP * nonOccupying.length
          : 0;
      y += cancelledOffset + (currentMinutes - segStart) * MINUTE_HEIGHT;
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
};

const AutoCurrentTimeIndicator = memo(function AutoCurrentTimeIndicator({
  segments,
  effectiveStart,
  timelineEnd,
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
    <CurrentTimeIndicator top={nowOffset} time={formatTime(currentMinutes)} />
  );
});

const TimeSlotListBase: React.FC<TimeSlotListProps> = ({
  appointments,
  breaks = [],
  workingDayId,
  startAt,
  endAt,
  date,
  onHighlightScroll,
}) => {
  const isToday = isCurrentDay(date);
  const [expandedSlotId, setExpandedSlotId] = useState<number | null>(null);
  const [freeSlotRange, setFreeSlotRange] = useState<FreeSlotRange | null>(
    null,
  );
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

  const isNowInRange = currentMinutes >= effectiveStart;

  const handleSlotPress = useCallback((id: number) => {
    router.push(Routers.app.calendar.slot(id));
  }, []);

  const handleToggleExpand = useCallback((id: number) => {
    setExpandedSlotId((prev) => (prev === id ? null : id));
  }, []);

  const handleFreeSlotPress = useCallback((start: number, end: number) => {
    setFreeSlotRange({ start, end });
  }, []);

  const handleCloseFreeSlotModal = useCallback(() => {
    setFreeSlotRange(null);
  }, []);

  const handleFreeSlotNext = useCallback(
    (startMinutes: number) => {
      router.push(
        Routers.app.createSlotFlow.selectService({
          date: date ?? undefined,
          time: formatTime(startMinutes),
        }),
      );
    },
    [date],
  );

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
    <>
      <View className="flex-1 px-screen relative">
        {isToday && (
          <AutoCurrentTimeIndicator
            segments={segments}
            effectiveStart={effectiveStart}
            timelineEnd={timelineEnd}
          />
        )}
        {segments.map((segment, segIndex) => {
          const { segStart, segEnd, content } = segment;
          const isLast = segIndex === segments.length - 1;

          const segHeight = getSegmentHeight(segment);
          const gridHeight = (segEnd - segStart) * MINUTE_HEIGHT;

          return (
            <View
              key={segStart}
              className="flex-row relative"
              style={{ height: segHeight }}
            >
              <SegmentGridMarks
                segStart={segStart}
                segEnd={segEnd}
                content={content}
                isLast={isLast}
              />
              <View className="relative w-[50px]">
                <TimeLabels
                  segStart={segStart}
                  segEnd={segEnd}
                  gridHeight={gridHeight}
                  isLast={isLast}
                />
              </View>

              <View
                className="flex-1 pl-2.5 relative"
                style={{ gap: SLOT_GAP, paddingTop: SLOT_GAP }}
              >
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
                        }}
                      />
                    ))}
                    {content.filteredBlock && <FilteredSlotBlock />}
                    {content.showFreeSlotBlock && (
                      <FreeSlotPressable
                        start={segStart}
                        end={content.freeRangeEnd}
                        onPress={handleFreeSlotPress}
                      />
                    )}
                  </>
                )}
              </View>
            </View>
          );
        })}
      </View>

      <FreeSlotStartModal
        key={freeSlotRange?.start}
        visible={!!freeSlotRange}
        range={freeSlotRange}
        onClose={handleCloseFreeSlotModal}
        onNext={handleFreeSlotNext}
      />
    </>
  );
};

const TimeSlotList = memo(TimeSlotListBase);

export default TimeSlotList;
