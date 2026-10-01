import React from "react";
import { View } from "react-native";
import { router } from "expo-router";
import { Badge, Card, Typography } from "@/src/components/ui";
import { Routers } from "@/src/constants/routers";
import { APPOINTMENT_STATUS_CONFIG } from "@/src/constants/appointmentStatuses";
import { formatDayMonth, formatTimeString } from "@/src/utils/date/formatTime";
import type { Appointment } from "@/src/store/redux/services/api-types";

type UpcomingSectionProps = {
  appointments: Appointment[];
};

const UpcomingSection = ({ appointments }: UpcomingSectionProps) => {
  if (appointments.length === 0) return null;

  return (
    <View className="gap-2">
      <Typography className="text-caption">Предстоящие</Typography>
      {appointments.map((appointment) => {
        const config = APPOINTMENT_STATUS_CONFIG[appointment.status];
        return (
          <Card
            key={appointment.id}
            title={
              appointment.services.map((s) => s.name).join(" + ") || "Запись"
            }
            subtitle={`${formatDayMonth(appointment.date)} | ${formatTimeString(appointment.start_time)}`}
            onPress={() => router.push(Routers.app.slot(appointment.id))}
            right={
              <Badge title={config.label} variant={config.variant} size="sm" />
            }
          />
        );
      })}
    </View>
  );
};

export default UpcomingSection;
