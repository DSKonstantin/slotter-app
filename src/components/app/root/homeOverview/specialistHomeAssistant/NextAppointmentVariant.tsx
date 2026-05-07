import React, { memo } from "react";
import { View } from "react-native";
import { router } from "expo-router";
import { Button, StSvg, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import { formatTimeFromISO } from "@/src/utils/date/formatTime";
import { formatRublesFromCents } from "@/src/utils/price/formatPrice";
import { pluralize } from "@/src/utils/text/pluralize";
import { APPOINTMENT_STATUS_CONFIG } from "@/src/constants/appointmentStatuses";
import { Routers } from "@/src/constants/routers";
import type { UpcomingAppointment } from "@/src/store/redux/services/api-types";

type Props = {
  appointments: UpcomingAppointment[];
};

function NextAppointmentVariantComponent({ appointments }: Props) {
  const next = appointments[0];
  if (!next) return null;

  const totalCount = appointments.length;
  const statusConfig = APPOINTMENT_STATUS_CONFIG[next.status];
  const additionalCount = next.additional_services?.length ?? 0;

  return (
    <View className="flex-row flex-wrap items-center gap-1">
      <StSvg name="Date_range_fill" size={16} color={colors.neutral[900]} />
      <Typography weight="semibold" className="text-xl text-neutral-900">
        {totalCount} {pluralize(totalCount, ["запись", "записи", "записей"])}
      </Typography>
      <Dot />
      <Typography weight="semibold" className="text-xl text-neutral-500">
        ближайшая
      </Typography>
      <Button
        size="xs"
        title="запись"
        variant="secondary"
        buttonClassName="gap-0 rounded-lg"
        onPress={() => router.push(Routers.app.calendar.slot(next.id))}
        rightIcon={
          <StSvg name="Expand_right" size={16} color={colors.neutral[700]} />
        }
      />
      <Typography weight="semibold" className="text-xl text-neutral-900">
        в
      </Typography>
      <Typography weight="semibold" className="text-xl text-neutral-900">
        {formatTimeFromISO(next.start_time)}
      </Typography>
      <Dot />
      <Typography
        weight="semibold"
        className="text-xl text-neutral-900 lowercase"
      >
        {statusConfig.label}
      </Typography>
      <StSvg name="Check_round_fill" size={20} color={colors.neutral[900]} />

      <Dot />
      <Typography weight="semibold" className="text-xl text-neutral-500">
        стоимость
      </Typography>
      <StSvg name="Money_fill" size={20} color={colors.neutral[900]} />
      <Typography weight="semibold" className="text-xl text-neutral-900">
        {formatRublesFromCents(next.price_cents)}
      </Typography>
      {additionalCount > 0 ? (
        <>
          <Dot />
          <Typography weight="semibold" className="text-xl text-neutral-900">
            +{additionalCount}{" "}
            {pluralize(additionalCount, [
              "доп. услуга",
              "доп. услуги",
              "доп. услуг",
            ])}
          </Typography>
        </>
      ) : (
        <>
          <Dot />
          <Typography weight="semibold" className="text-xl text-neutral-900">
            без доп. услуг
          </Typography>
        </>
      )}
    </View>
  );
}

const Dot = () => (
  <Typography className="text-xl text-neutral-900">·</Typography>
);

export default memo(NextAppointmentVariantComponent);
