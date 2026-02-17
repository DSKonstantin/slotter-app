import type { Schedule } from "@/src/store/redux/slices/calendarSlice";
import React from "react";
import { View, ScrollView } from "react-native";
import { Divider, Typography } from "@/src/components/ui";
import { TAB_BAR_HEIGHT } from "@/src/constants/tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import SlotCard from "@/src/components/shared/cards/scheduling/slotCard";

const HOUR_HEIGHT = 64;
const MINUTE_HEIGHT = HOUR_HEIGHT / 60;

type TimeSlotListProps = {
  schedule: Schedule;
};

const TimeSlotList: React.FC = ({ schedule }: TimeSlotListProps) => {
  const { bottom } = useSafeAreaInsets();

  const renderTimeMarkers = () => {
    const startHour = 9;
    const endHour = 17;

    const markers = [];

    for (let hour = startHour; hour <= endHour; hour++) {
      markers.push(
        <View
          key={hour}
          style={{
            height: HOUR_HEIGHT,
          }}
          className="relative justify-start items-start"
        >
          {/* Верхняя линия */}
          {/*<Divider className="absolute top-0 left-0 right-0" />*/}

          <Divider className="absolute left-0 right-0 bottom-0" />

          <Typography className="text-sm text-gray-500">{hour}:00</Typography>

          {/* Нижняя линия */}
          {/*<Divider className="absolute bottom-0 left-0 right-0" />*/}
        </View>,
      );
    }

    return markers;
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      className="flex-1 pt-4 px-screen"
      contentContainerStyle={{
        paddingBottom: TAB_BAR_HEIGHT + bottom + 74,
      }}
    >
      <View className="flex-row gap-2.5 items-start">
        <View className="w-12 h-full">{renderTimeMarkers()}</View>

        <View className="flex-1 gap-1">
          {schedule.map((slot) => (
            <SlotCard
              key={slot.id}
              variant={slot.variant}
              time={`${slot.startTime} - ${slot.endTime}`}
              client={"client" in slot ? slot.client : undefined}
              price={"price" in slot ? slot.price : undefined}
              service={"service" in slot ? slot.service : undefined}
              status={slot.status}
            />
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

export default TimeSlotList;
