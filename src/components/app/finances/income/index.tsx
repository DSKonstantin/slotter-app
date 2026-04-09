import React, { useState } from "react";
import { ScrollView, View } from "react-native";
import ScreenWithToolbar from "@/src/components/shared/layout/screenWithToolbar";
import TrendChartCard from "@/src/components/shared/cards/trendChartCard";
import { Card, Divider, SegmentedControl, StSvg } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";

const GROUP_OPTIONS = [
  { label: "По услугам", value: "services" },
  { label: "По клиентам", value: "clients" },
];

const FinancesIncomeScreen = () => {
  const [groupBy, setGroupBy] = useState(GROUP_OPTIONS[0].value);

  return (
    <ScreenWithToolbar title="Доходы по периоду">
      {({ topInset, bottomInset }) => (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingTop: topInset,
            paddingBottom: bottomInset + 16,
            paddingHorizontal: 20,
            gap: 20,
          }}
        >
          <TrendChartCard />

          <Card
            title="732 500 ₽"
            subtitle="Итого за период"
            titleProps={{ style: { fontSize: 20 } }}
          />

          <Divider className="my-4" />

          <SegmentedControl
            value={groupBy}
            onChange={setGroupBy}
            options={GROUP_OPTIONS}
          />

          <Divider className="my-4" />

          <Card
            title="+ 54%"
            titleProps={{ style: { color: colors.primary.green[400] } }}
            subtitle="Тренд за период"
            left={
              <View className="mb-[18px]">
                <StSvg
                  name="Line_up"
                  size={24}
                  color={colors.primary.green[400]}
                />
              </View>
            }
          />
        </ScrollView>
      )}
    </ScreenWithToolbar>
  );
};

export default FinancesIncomeScreen;
