import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import type {
  Appointment,
  WorkingDayBreak,
} from "@/src/store/redux/services/api-types";
import { View } from "react-native";
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

  useEffect(() => {
    if (!highlightSlotId || segments.length === 0) return;
    const slot = appointments.find((a) => a.id === highlightSlotId);
    if (slot) {
      onHighlightScroll?.(
        Math.max(
          0,
          (parseTime(slot.start_time) - effectiveStart) * MINUTE_HEIGHT - 50,
        ),
      );
    }
    const timer = setTimeout(() => dispatch(clearHighlightSlotId()), 3000);
    return () => clearTimeout(timer);
  }, [
    highlightSlotId,
    effectiveStart,
    segments,
    dispatch,
    onHighlightScroll,
    appointments,
  ]);

  if (segments.length === 0) return null;

  return (
    <View className="flex-1 pt-4 px-screen">
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
