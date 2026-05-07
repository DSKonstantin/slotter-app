import React, { useMemo } from "react";
import { ActivityIndicator, View } from "react-native";
import { addDays, format, parseISO } from "date-fns";
import { ru } from "date-fns/locale";
import { Card, StSvg, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import { formatApiDate, formatDayMonthLong } from "@/src/utils/date/formatDate";
import { useGetWorkingDaysQuery } from "@/src/store/redux/services/api/workingDaysApi";

const DATE_RANGE_DAYS = 60;

type Props = {
  userId: number;
  onPick: (date: string) => void;
};

const DatePicker = ({ userId, onPick }: Props) => {
  const dateRange = useMemo(() => {
    const today = new Date();
    return {
      date_from: formatApiDate(today),
      date_to: formatApiDate(addDays(today, DATE_RANGE_DAYS)),
    };
  }, []);

  const { data: workingDaysData, isLoading } = useGetWorkingDaysQuery({
    userId,
    ...dateRange,
  });

  const dates = useMemo(() => {
    if (!workingDaysData) return [];
    const todayKey = formatApiDate(new Date());
    return Object.entries(workingDaysData)
      .filter(([key, wd]) => wd?.is_active && key >= todayKey)
      .map(([key]) => key)
      .sort();
  }, [workingDaysData]);

  if (isLoading) {
    return (
      <View className="items-center py-6">
        <ActivityIndicator color={colors.neutral[400]} />
      </View>
    );
  }
  if (dates.length === 0) {
    return (
      <View className="items-center py-6">
        <Typography className="text-neutral-400">
          Нет доступных рабочих дней
        </Typography>
      </View>
    );
  }

  return (
    <View className="gap-2">
      {dates.map((date) => {
        const d = parseISO(date);
        return (
          <Card
            key={date}
            title={formatDayMonthLong(d)}
            subtitle={format(d, "EEEE", { locale: ru })}
            onPress={() => onPick(date)}
            right={
              <StSvg
                name="Expand_right_light"
                size={24}
                color={colors.neutral[500]}
              />
            }
          />
        );
      })}
    </View>
  );
};

export default DatePicker;
