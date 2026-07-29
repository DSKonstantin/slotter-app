import React, { useMemo, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { skipToken } from "@reduxjs/toolkit/query";
import { router } from "expo-router";

import { Typography } from "@/src/components/ui";
import AppointmentCard from "@/src/components/shared/cards/scheduling/appointmentCard";
import RetryInline from "@/src/components/shared/retryInline";
import SlotLimitModal from "@/src/components/shared/modals/SlotLimitModal";
import { useGetAppointmentsQuery } from "@/src/store/redux/services/api/appointmentsApi";
import type { Appointment } from "@/src/store/redux/services/api-types";
import { formatTimeString } from "@/src/utils/date/formatTime";
import { isHiddenCustomer } from "@/src/utils/customer";
import { Routers } from "@/src/constants/routers";

type Props = {
  userId: number;
  date: string;
};

const DayScheduleAppointments = ({ userId, date }: Props) => {
  const [slotLimitVisible, setSlotLimitVisible] = useState(false);
  const { data, isLoading, isError, refetch } = useGetAppointmentsQuery(
    userId ? { userId, params: { date } } : skipToken,
  );

  const appointments = useMemo(
    () =>
      ((data as Appointment[] | undefined) ?? [])
        .slice()
        .sort((a, b) => a.start_time.localeCompare(b.start_time)),
    [data],
  );

  if (isLoading) {
    return <ActivityIndicator />;
  }

  if (isError) {
    return (
      <RetryInline
        text="Не удалось загрузить записи"
        buttonText="Повторить"
        onRetry={refetch}
      />
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
      {appointments.map((appointment) => {
        const isQuotaHidden = isHiddenCustomer(appointment.customer);
        return (
          <AppointmentCard
            key={appointment.id}
            time={`${formatTimeString(appointment.start_time)} - ${formatTimeString(appointment.end_time)}`}
            name={
              isQuotaHidden
                ? "******"
                : (appointment.customer?.name ?? "Без клиента")
            }
            service={
              isQuotaHidden
                ? "*** . ** . ***"
                : appointment.services.map((s) => s.name).join(", ")
            }
            onPress={() =>
              isQuotaHidden
                ? setSlotLimitVisible(true)
                : router.push(Routers.app.slot(appointment.id))
            }
          />
        );
      })}

      <SlotLimitModal
        visible={slotLimitVisible}
        onClose={() => setSlotLimitVisible(false)}
      />
    </View>
  );
};

export default DayScheduleAppointments;
