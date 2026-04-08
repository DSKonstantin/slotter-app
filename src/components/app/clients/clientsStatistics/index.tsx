import React, { useState } from "react";
import { View, ScrollView, TouchableOpacity } from "react-native";
import ScreenWithToolbar from "@/src/components/shared/layout/screenWithToolbar";
import { Button, Divider, StSvg, Typography } from "@/src/components/ui";
import StatCard from "@/src/components/shared/cards/statСard";
import { pluralize } from "@/src/utils/text/pluralize";
import { colors } from "@/src/styles/colors";
import { router } from "expo-router";
import PeriodModal, {
  PERIODS,
  CUSTOM_PERIOD_VALUE,
  type Period,
} from "./periodModal";

const MOCK_STATS = {
  new: 18,
  returning: 64,
  averageCheck: 3200,
  lost: 12,
  byService: [
    { name: "Стрижка", count: 42 },
    { name: "Окрашивание", count: 28 },
    { name: "Лечение", count: 35 },
  ],
};

const ClientsStatistics = () => {
  const [periodModalVisible, setPeriodModalVisible] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<Period>(PERIODS[1]);

  const handleSelectPeriod = (period: Period) => {
    setSelectedPeriod(period);
    if (period.value !== CUSTOM_PERIOD_VALUE) {
      setPeriodModalVisible(false);
    }
  };

  return (
    <ScreenWithToolbar title="Статистика клиентов">
      {({ topInset, bottomInset }) => (
        <>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingTop: topInset,
              paddingBottom: bottomInset + 16,
              paddingHorizontal: 20,
            }}
          >
            <View className="gap-2 mb-6">
              <Typography
                weight="medium"
                className="text-caption text-neutral-500"
              >
                Период
              </Typography>
              <TouchableOpacity
                activeOpacity={0.7}
                className="flex-row items-center justify-between bg-background-surface rounded-small min-h-[48px] px-4"
                onPress={() => setPeriodModalVisible(true)}
              >
                <Typography
                  weight="medium"
                  className="text-body text-neutral-900"
                >
                  {selectedPeriod.label}
                </Typography>
                <StSvg
                  name="Date_today"
                  size={20}
                  color={colors.neutral[500]}
                />
              </TouchableOpacity>
            </View>

            <View className="flex-row gap-2 mb-2">
              <StatCard
                value={MOCK_STATS.new}
                label="Новые"
                tag={{ title: "+ 5%", size: "sm", variant: "mint" }}
              />
              <StatCard
                value={MOCK_STATS.returning}
                label="Вернувшиеся"
                tag={{ title: "+ 12%", size: "sm", variant: "mint" }}
              />
            </View>

            <View className="flex-row gap-2 mb-6">
              <StatCard
                value={`${MOCK_STATS.averageCheck} ₽`}
                label="Средний чек"
                tag={{ title: "+ 8%", size: "sm", variant: "mint" }}
              />
              <StatCard
                value={MOCK_STATS.lost}
                label="Потерянные"
                tag={{ title: "- 3%", size: "sm", variant: "error" }}
              />
            </View>

            <View className="bg-background-surface rounded-base p-4 gap-4 mb-6">
              <Typography
                weight="semibold"
                className="text-body text-neutral-900"
              >
                Статистика по услугам
              </Typography>

              <Divider />

              {MOCK_STATS.byService.map((service, index) => (
                <React.Fragment key={service.name}>
                  <View className="flex-row items-center justify-between">
                    <Typography className="text-body text-neutral-500">
                      {service.name}
                    </Typography>
                    <Typography
                      weight="regular"
                      className="text-body text-neutral-900"
                    >
                      {service.count}{" "}
                      {pluralize(service.count, [
                        "клиент",
                        "клиента",
                        "клиентов",
                      ])}
                    </Typography>
                  </View>
                  {index < MOCK_STATS.byService.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </View>

            <Button
              title="Выбрать клиента для просмотра истории"
              onPress={() => router.back()}
            />
          </ScrollView>

          <PeriodModal
            visible={periodModalVisible}
            selectedPeriod={selectedPeriod}
            onClose={() => setPeriodModalVisible(false)}
            onSelectPeriod={handleSelectPeriod}
          />
        </>
      )}
    </ScreenWithToolbar>
  );
};

export default ClientsStatistics;
