import React from "react";
import { View } from "react-native";
import { Typography } from "@/src/components/ui";
import TimeSlotCard from "@/src/components/shared/cards/scheduling/timeSlotCard";

const mockAppointments = [
  {
    timeStart: "10:00",
    clientName: "Анна Петрова",
    service: "Стрижка + укладка",
  },
  {
    timeStart: "11:00",
    clientName: "Мария Иванова",
    service: "Окрашивание",
  },
  {
    timeStart: "15:00",
    clientName: "Ольга Сидорова",
    service: "Укладка вечерняя",
  },
];

type Props = {
  date: string;
};

const DayScheduleAppointments = ({ date: _date }: Props) => {
  return (
    <View className="gap-2.5">
      <Typography className="text-caption text-neutral-500">
        Записи на этот день
      </Typography>
      {mockAppointments.map((appointment, index) => (
        <TimeSlotCard
          key={index}
          time={appointment.timeStart}
          name={appointment.clientName}
          service={appointment.service}
        />
      ))}
    </View>
  );
};

export default DayScheduleAppointments;
