import React from "react";
import { View, ScrollView } from "react-native";
import { Typography } from "@/src/components/ui";
import { TAB_BAR_HEIGHT } from "@/src/constants/tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import SlotCard from "@/src/components/shared/cards/scheduling/slotCard";

const HOUR_HEIGHT = 120;
const MINUTE_HEIGHT = HOUR_HEIGHT / 60;
const SLOT_GAP = 2;

const parseTime = (iso: string) => {
  const m = iso.match(/T(\d{2}):(\d{2})/);
  return m ? +m[1] * 60 + +m[2] : 0;
};

const formatTime = (min: number) =>
  `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;

type TimeSlotListProps = {
  schedule: Schedule[];
  startAt?: string;
  endAt?: string;
};

const TimeSlotList: React.FC<TimeSlotListProps> = ({
  schedule,
  startAt,
  endAt,
}) => {
  const { bottom } = useSafeAreaInsets();

  if (!startAt || !endAt) {
    return (
      <View
        className="flex-1 items-center justify-center"
        style={{ marginBottom: TAB_BAR_HEIGHT + bottom + 20 }}
      >
        <Typography className="text-body text-neutral-400">
          Записей на этот день нет
        </Typography>
      </View>
    );
  }

  const start = parseTime(startAt);
  const end = parseTime(endAt);
  const startHour = Math.floor(start / 60);
  const endHour = Math.ceil(end / 60);
  const hourMarkers = Array.from(
    { length: endHour - startHour + 1 },
    (_, i) => (startHour + i) * 60,
  );

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      className="flex-1 pt-4 px-screen"
      contentContainerStyle={{ paddingBottom: TAB_BAR_HEIGHT + bottom + 74 }}
    >
      {hourMarkers.map((hourMin) => {
        const slotsInHour = schedule.filter(
          (slot) => Math.floor(parseTime(slot.timeStart) / 60) * 60 === hourMin,
        );

        return (
          <View
            key={hourMin}
            style={{ flexDirection: "row", minHeight: HOUR_HEIGHT }}
          >
            <View className="w-16 border-r border-neutral-200 pr-2">
              <Typography className="text-sm text-gray-500">
                {formatTime(hourMin)}
              </Typography>
            </View>

            <View className="flex-1 pl-2.5">
              {slotsInHour.map((slot) => (
                <View
                  key={slot.id}
                  style={{
                    marginTop:
                      (parseTime(slot.timeStart) - hourMin) * MINUTE_HEIGHT +
                      SLOT_GAP,
                    height:
                      (parseTime(slot.timeEnd) - parseTime(slot.timeStart)) *
                        MINUTE_HEIGHT -
                      SLOT_GAP * 2,
                  }}
                >
                  <SlotCard slot={slot} />
                </View>
              ))}
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
};

export default TimeSlotList;
