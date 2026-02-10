import React from "react";
import { View, ScrollView } from "react-native";
import { Typography } from "@/src/components/ui";
import { TAB_BAR_HEIGHT } from "@/src/constants/tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import SlotCard from "@/src/components/shared/cards/scheduling/slotCard";

const mockSlots = [
  {
    id: "1",
    variant: "free",
    startTime: "9:00",
    endTime: "10:00",
  },
  {
    id: "2",
    variant: "booked",
    startTime: "10:00",
    endTime: "11:00",
    client: "Анна Петрова",
    price: "3 500 ₽",
    service: "Стрижка + укладка",
    additional: "+ 2 доп.",
    status: "confirmed",
  },
  {
    id: "3",
    variant: "booked",
    startTime: "11:00",
    endTime: "13:00",
    client: "Мария Иванова",
    price: "5 000 ₽",
    service: "Окрашивание",
    status: "pending",
  },
  {
    id: "4",
    variant: "free",
    startTime: "13:00",
    endTime: "15:00",
  },
  {
    id: "5",
    variant: "booked",
    startTime: "15:00",
    endTime: "16:30",
    client: "Ольга Сидорова",
    price: "4 000 ₽",
    service: "Укладка вечерняя",
    additional: "+ 1 доп.",
    status: "confirmed",
  },
  {
    id: "6",
    variant: "free",
    startTime: "16:30",
    endTime: "17:00",
  },
];

const TimeSlotList: React.FC = () => {
  const { bottom } = useSafeAreaInsets();

  const renderTimeMarkers = () => {
    const hours = [];
    for (let i = 9; i <= 17; i++) {
      hours.push(
        <View key={i} className="h-[64px] justify-start pt-2">
          <Typography className="text-sm text-gray-500">{i}:00</Typography>
        </View>,
      );
    }
    return hours;
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      className="flex-1 mt-4 px-screen"
      contentContainerStyle={{
        paddingBottom: TAB_BAR_HEIGHT + bottom + 74,
      }}
    >
      <View className="flex-row">
        <View className="w-12">{renderTimeMarkers()}</View>

        <View className="flex-1 gap-1">
          {mockSlots.map((slot) => (
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
