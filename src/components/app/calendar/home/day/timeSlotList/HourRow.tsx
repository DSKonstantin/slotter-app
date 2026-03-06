import React, { useCallback } from "react";
import { View } from "react-native";
import { router } from "expo-router";
import { Typography } from "@/src/components/ui";
import SlotCard from "@/src/components/shared/cards/scheduling/slotCard";
import { HOUR_HEIGHT, MINUTE_HEIGHT, SLOT_GAP } from "./constants";
import { parseTime, formatTime } from "./utils";
import { Routers } from "@/src/constants/routers";

type HourRowProps = {
  hourMin: number;
  schedule: Schedule[];
};

const HourRow: React.FC<HourRowProps> = ({ hourMin, schedule }) => {
  const slotsInHour = schedule.filter(
    (slot) => Math.floor(parseTime(slot.timeStart) / 60) * 60 === hourMin,
  );

  const handleSlotPress = useCallback((slot: Schedule) => {
    if (slot.status === "available") {
      const timeMatch = slot.timeStart.match(/T(\d{2}:\d{2})/);
      const time = timeMatch ? timeMatch[1] : undefined;
      const dateMatch = slot.timeStart.match(/^(\d{4}-\d{2}-\d{2})/);
      const date = dateMatch ? dateMatch[1] : undefined;
      router.push(Routers.app.calendar.slotSelectService({ date, time }));
    } else {
      router.push(Routers.app.calendar.slot(slot.id));
    }
  }, []);

  return (
    <View style={{ flexDirection: "row", minHeight: HOUR_HEIGHT }}>
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
            <SlotCard slot={slot} onPress={() => handleSlotPress(slot)} />
          </View>
        ))}
      </View>
    </View>
  );
};

export default HourRow;
