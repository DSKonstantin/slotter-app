import React from "react";
import { ActivityIndicator, View } from "react-native";
import { skipToken } from "@reduxjs/toolkit/query";
import { router } from "expo-router";

import { Typography } from "@/src/components/ui";
import TimeSlotCard from "@/src/components/shared/cards/scheduling/timeSlotCard";
import { useGetAppointmentsQuery } from "@/src/store/redux/services/api/appointmentsApi";
import type { Appointment } from "@/src/store/redux/services/api-types";
import { formatTimeFromISO } from "@/src/utils/date/formatTime";
import { Routers } from "@/src/constants/routers";

type Props = {
  userId: number;
  date: string;
};

const DayScheduleAppointments = ({ userId, date }: Props) => {
  const { data, isLoading } = useGetAppointmentsQuery(
    userId ? { userId, params: { date } } : skipToken,
  );

  const appointments = (data as Appointment[] | undefined) ?? [];

  if (isLoading) {
    return <ActivityIndicator />;
  }

  if (appointments.length === 0) {
    return null;
  }

  return (
    <View className="gap-2.5">
      <Typography className="text-caption text-neutral-500">
        Записи на этот день
      </Typography>
      {appointments.map((appointment) => (
        <TimeSlotCard
          key={appointment.id}
          time={formatTimeFromISO(appointment.start_time)}
          name={appointment.customer.name}
          service={appointment.services[0]?.name ?? ""}
          onPress={() => router.push(Routers.app.calendar.slot(appointment.id))}
        />
      ))}
    </View>
  );
};

export default DayScheduleAppointments;
