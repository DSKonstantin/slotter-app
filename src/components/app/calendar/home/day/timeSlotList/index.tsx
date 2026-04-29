import React, { memo, useCallback, useEffect, useMemo } from "react";
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
  startAt?: string;
  endAt?: string;
  date?: string;
  onHighlightScroll?: (y: number) => void;
};

const TimeSlotListBase: React.FC<TimeSlotListProps> = ({
  appointments,
  breaks = [],
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

  const handleSlotPress = useCallback((id: number) => {
    router.push(Routers.app.calendar.slot(id));
  }, []);

  const segments = useMemo(() => {
    if (!startAt || !endAt) return null;
    return createSegments(
      startAt,
      endAt,
      breaks,
      appointments,
      visibleStatuses,
    );
  }, [appointments, visibleStatuses, breaks, startAt, endAt]);

  useEffect(() => {
    if (!highlightSlotId || !startAt) return;
    const slot = appointments.find((a) => a.id === highlightSlotId);
    if (slot) {
      onHighlightScroll?.(
        Math.max(
          0,
          (parseTime(slot.start_time) - parseTime(startAt)) * MINUTE_HEIGHT -
            50,
        ),
      );
    }
    const timer = setTimeout(() => dispatch(clearHighlightSlotId()), 3000);
    return () => clearTimeout(timer);
  }, [highlightSlotId, startAt, dispatch, onHighlightScroll, appointments]);

  if (!segments) return null;

  return (
    <View className="flex-1 pt-4 px-screen">
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
                    highlighted={slot.id === highlightSlotId}
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
    </View>
  );
};

const TimeSlotList = memo(TimeSlotListBase);

export default TimeSlotList;
