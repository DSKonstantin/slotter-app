import React, { memo } from "react";
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
  const serviceName = current.services[0]?.name;

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
          {formatRublesFromCents(current.price_cents)}
        </Typography>
      </View>

      <WaitingNext appointments={appointments} />
    </View>
  );
}

export default memo(CurrentAndNextComponent);
