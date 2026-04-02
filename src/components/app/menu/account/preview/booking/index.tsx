import React, { useMemo } from "react";
import { ActivityIndicator, View } from "react-native";
import { skipToken } from "@reduxjs/toolkit/query";
import { Button, Divider, Typography } from "@/src/components/ui";
import { StSvg } from "@/src/components/ui/StSvg";
import { colors } from "@/src/styles/colors";
import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";
import { useGetAvailableSlotsQuery } from "@/src/store/redux/services/api/appointmentsApi";
import { formatApiDate } from "@/src/utils/date/formatDate";
import {
  formatDayMonth,
  formatMinutes,
  parseTime,
} from "@/src/utils/date/formatTime";

const Booking = () => {
  const auth = useRequiredAuth();

  const dates = useMemo(() => {
    const today = new Date();
    return [0, 1, 2].map((offset) => {
      const d = new Date(today);
      d.setDate(today.getDate() + offset);
      return d;
    });
  }, []);

  const apiDates = useMemo(() => dates.map(formatApiDate), [dates]);

  const query0 = useGetAvailableSlotsQuery(
    auth ? { userId: auth.userId, date: apiDates[0] } : skipToken,
  );
  const query1 = useGetAvailableSlotsQuery(
    auth ? { userId: auth.userId, date: apiDates[1] } : skipToken,
  );
  const query2 = useGetAvailableSlotsQuery(
    auth ? { userId: auth.userId, date: apiDates[2] } : skipToken,
  );

  const isLoading = query0.isLoading || query1.isLoading || query2.isLoading;

  const slots = useMemo(() => {
    return [query0, query1, query2].map((query, index) => {
      const firstSlot = query.data?.[0];
      return {
        date: formatDayMonth(apiDates[index]),
        time: firstSlot
          ? `${firstSlot} - ${formatMinutes(parseTime(firstSlot) + 60)}`
          : "—",
      };
    });
  }, [query0, query1, query2, apiDates]);

  return (
    <View className="gap-5 rounded-[30px] bg-background-surface px-4 pt-4 pb-2 mx-screen">
      <Button
        title="Записаться"
        variant="primary"
        size="md"
        onPress={() => {}}
        rightIcon={
          <StSvg name="Expand_right" size={20} color={colors.neutral[0]} />
        }
      />

      <View className="gap-3">
        <Typography className="text-center text-body text-neutral-500">
          Ближайшее свободное время
        </Typography>

        {isLoading ? (
          <View className="items-center py-2">
            <ActivityIndicator color={colors.neutral[400]} />
          </View>
        ) : (
          <View className="flex-row items-center">
            {slots.map((slot, index) => (
              <React.Fragment key={slot.date}>
                {index > 0 && <Divider vertical />}
                <View className="flex-1 items-center gap-0.5">
                  <Typography
                    weight="semibold"
                    className="text-body text-neutral-900"
                  >
                    {slot.date}
                  </Typography>
                  <Typography className="text-body text-neutral-500">
                    {slot.time}
                  </Typography>
                </View>
              </React.Fragment>
            ))}
          </View>
        )}

        <Button
          title="Условия записи"
          variant="clear"
          size="sm"
          onPress={() => {}}
          buttonClassName="justify-center"
          leftIcon={
            <StSvg name="Info_alt_fill" size={20} color={colors.neutral[900]} />
          }
        />
      </View>
    </View>
  );
};

export default Booking;
