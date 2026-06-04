import React, { useState } from "react";
import { ScrollView, View } from "react-native";
import ScreenWithToolbar from "@/src/components/shared/layout/screenWithToolbar";
import { Badge, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";

const FILTER_PERIODS = ["Неделя", "Месяц"] as const;

const STATS = [
  { value: "142", label: "Отправлено", color: "text-primary-blue-500" },
  { value: "138", label: "Доставлено", color: "text-primary-green-600" },
  { value: "4", label: "Ошибки", color: "text-accent-red-500" },
  { value: "97%", label: "Доставляемость", color: "text-purple-500" },
] as const;

const NOTIFICATION_TYPES = [
  { label: "Создание записи", count: 48, color: colors.primary.green[600] },
  {
    label: "Напоминание о визите",
    count: 41,
    color: colors.accent.purple[500],
  },
  { label: "Отмена записи", count: 14, color: colors.accent.red[500] },
  { label: "Запрос отзыва", count: 9, color: colors.accent.orange[500] },
  { label: "Повторный визит", count: 6, color: colors.primary.blue[500] },
];

const MAX_COUNT = Math.max(...NOTIFICATION_TYPES.map((t) => t.count));

const NotificationsStatistics = () => {
  const [activePeriod, setActivePeriod] = useState(0);

  return (
    <ScreenWithToolbar title="Статистика">
      {({ topInset, bottomInset }) => (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingTop: topInset,
            paddingBottom: bottomInset + 8,
          }}
          className="px-screen"
        >
          <View className="flex-row gap-2 mb-5">
            {FILTER_PERIODS.map((period, i) => (
              <Badge
                key={period}
                title={period}
                variant={i === activePeriod ? "accent" : "ghost"}
                onPress={() => setActivePeriod(i)}
              />
            ))}
          </View>

          <View className="flex-row gap-2 mb-2">
            {STATS.slice(0, 2).map(({ value, label, color }) => (
              <View
                key={label}
                className="flex-1 bg-background-surface p-4 rounded-base"
              >
                <Typography
                  weight="semibold"
                  className={`text-display ${color}`}
                >
                  {value}
                </Typography>
                <Typography
                  weight="regular"
                  className="text-caption text-neutral-500"
                >
                  {label}
                </Typography>
              </View>
            ))}
          </View>

          <View className="flex-row gap-3 mb-5">
            {STATS.slice(2).map(({ value, label, color }) => (
              <View
                key={label}
                className="flex-1 bg-background-surface p-4 rounded-base"
              >
                <Typography
                  weight="semibold"
                  className={`text-display ${color}`}
                >
                  {value}
                </Typography>
                <Typography
                  weight="regular"
                  className="text-caption text-neutral-500"
                >
                  {label}
                </Typography>
              </View>
            ))}
          </View>

          <Typography className="text-caption text-neutral-500 mb-2">
            По типам уведомлений
          </Typography>

          <View className="bg-background-surface p-4 rounded-base gap-5">
            {NOTIFICATION_TYPES.map(({ label, count, color }) => (
              <View key={label}>
                <View className="flex-row justify-between mb-1">
                  <View className="flex-row items-center gap-1">
                    <View
                      className="w-[10px] h-[10px] rounded-full"
                      style={{
                        backgroundColor: color,
                      }}
                    />
                    <Typography weight="regular" className="text-body">
                      {label}
                    </Typography>
                  </View>

                  <Typography
                    weight="regular"
                    className="text-body text-neutral-500"
                  >
                    {count}
                  </Typography>
                </View>
                <View className="h-1 bg-neutral-100 rounded-full overflow-hidden">
                  <View
                    className="h-full rounded-full"
                    style={{
                      width: `${(count / MAX_COUNT) * 100}%`,
                      backgroundColor: color,
                    }}
                  />
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </ScreenWithToolbar>
  );
};

export default NotificationsStatistics;
