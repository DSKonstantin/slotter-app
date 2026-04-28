import React from "react";
import { ActivityIndicator, TouchableOpacity, View } from "react-native";
import { skipToken } from "@reduxjs/toolkit/query";
import { router } from "expo-router";

import { Typography } from "@/src/components/ui";
import AppointmentCard from "@/src/components/shared/cards/scheduling/appointmentCard";
import { useGetAppointmentsQuery } from "@/src/store/redux/services/api/appointmentsApi";
import type { Appointment } from "@/src/store/redux/services/api-types";
import { formatTimeString } from "@/src/utils/date/formatTime";
import { Routers } from "@/src/constants/routers";

type Props = {
  userId: number;
  date: string;
};

const DayScheduleAppointments = ({ userId, date }: Props) => {
  const { data, isLoading, isError, refetch } = useGetAppointmentsQuery(
    userId ? { userId, params: { date } } : skipToken,
  );

  const appointments = ((data as Appointment[] | undefined) ?? [])
    .slice()
    .sort((a, b) => a.start_time.localeCompare(b.start_time));

  if (isLoading) {
    return <ActivityIndicator />;
  }

  if (isError) {
    return (
      <View className="gap-1">
        <Typography className="text-caption text-neutral-500">
          Не удалось загрузить записи
        </Typography>
        <TouchableOpacity onPress={refetch}>
          <Typography className="text-caption text-primary-blue-500">
            Повторить
          </Typography>
        </TouchableOpacity>
      </View>
    );
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
        <AppointmentCard
          key={appointment.id}
          time={`${formatTimeString(appointment.start_time)} - ${formatTimeString(appointment.end_time)}`}
          name={appointment.customer?.name ?? ""}
          service={appointment.services.map((s) => s.name).join(", ")}
          onPress={() => router.push(Routers.app.calendar.slot(appointment.id))}
        />
      ))}
    </View>
  );
};

export default DayScheduleAppointments;
