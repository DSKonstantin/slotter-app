import React, { memo, useState } from "react";
import { View } from "react-native";
import { router } from "expo-router";
import { Button, StSvg, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import { formatTimeFromISO } from "@/src/utils/date/formatTime";
import { formatRublesFromCents } from "@/src/utils/price/formatPrice";
import { Routers } from "@/src/constants/routers";
import type {
  Appointment,
  UpcomingAppointment,
} from "@/src/store/redux/services/api-types";
import WaitingNext from "@/src/components/app/root/homeOverview/specialistHomeAssistant/WaitingNext";

type Props = {
  current: Appointment;
  appointments: UpcomingAppointment[];
};

const Dot = () => (
  <Typography className="text-xl text-neutral-900">·</Typography>
);

function CurrentAndNextComponent({ current, appointments }: Props) {
  const [expanded, setExpanded] = useState(false);
  const serviceName = current.services[0]?.name;
  const hasAppointments = appointments.length > 0;

  return (
    <View className="gap-2">
      <View className="flex-row flex-wrap items-center gap-1">
        <Typography weight="semibold" className="text-lg text-neutral-500">
          Сейчас
        </Typography>
        <Button
          size="xs"
          title="запись"
          variant="secondary"
          buttonClassName="gap-0 rounded-lg bg-background"
          onPress={() => router.push(Routers.app.calendar.slot(current.id))}
          rightIcon={
            <StSvg name="Expand_right" size={16} color={colors.neutral[700]} />
          }
        />
        <Typography weight="semibold" className="text-lg text-neutral-500">
          до
        </Typography>

        <Typography weight="semibold" className="text-xl text-neutral-900">
          {formatTimeFromISO(current.end_time)}{current.customer ? ` · ${current.customer.name}` : ""}
        </Typography>
        {serviceName && (
          <>
            <Dot />
            <Typography weight="semibold" className="text-lg text-neutral-500">
              услуга
            </Typography>
            <Typography weight="semibold" className="text-lg text-neutral-900">
              {serviceName}
            </Typography>
          </>
        )}
        <Dot />
        <Typography weight="semibold" className="text-lg text-neutral-500">
          стоимость
        </Typography>
        <StSvg name="Money_fill" size={20} color={colors.neutral[900]} />
        <Typography weight="semibold" className="text-lg text-neutral-900">
          {formatRublesFromCents(current.price_cents ?? 0)}
        </Typography>
      </View>

      {hasAppointments && (
        <View className="gap-1">
          <Button
            title={expanded ? "Спрятать" : "Показать больше"}
            size="xs"
            variant="clear"
            buttonClassName="gap-1 self-start px-0"
            textClassName="text-neutral-500 text-[13px]"
            onPress={() => setExpanded((v) => !v)}
            rightIcon={
              <StSvg
                name={expanded ? "Expand_up_light" : "Expand_down_light"}
                size={16}
                color={colors.neutral[500]}
              />
            }
          />
          {expanded && <WaitingNext appointments={appointments} label="следующая" />}
        </View>
      )}
    </View>
  );
}

export default memo(CurrentAndNextComponent);
