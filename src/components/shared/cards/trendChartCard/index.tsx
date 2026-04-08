import React, { useState } from "react";
import { View, TouchableOpacity, useWindowDimensions } from "react-native";
import { BarChart } from "react-native-gifted-charts";
import { StSvg, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import { formatRublesWithSymbol } from "@/src/utils/price/formatPrice";

type DataPoint = {
  value: number;
  label?: string;
};

type Period = {
  label: string;
  value: string;
};

type Props = {
  title?: string;
  data?: DataPoint[];
  periods?: Period[];
};

const MOCK_DATA: DataPoint[] = [
  { value: 120000, label: "Апр" },
  { value: 95000, label: "Май" },
  { value: 140000, label: "Июн" },
  { value: 130000, label: "Июл" },
  { value: 155000, label: "Авг" },
  { value: 105000, label: "Сен" },
  { value: 60000, label: "Окт" },
];

const MOCK_PERIODS: Period[] = [
  { label: "Апр-Окт", value: "apr-oct" },
  { label: "Янв-Июн", value: "jan-jun" },
  { label: "За год", value: "year" },
];

const TrendChartCard = ({
  title = "Динамика",
  data = MOCK_DATA,
  periods = MOCK_PERIODS,
}: Props) => {
  const [selectedPeriod, setSelectedPeriod] = useState(periods[0]);
  const [periodMenuVisible, setPeriodMenuVisible] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const { width: screenWidth } = useWindowDimensions();
  // 20px screen padding * 2 + 16px card padding * 2 + 60px y-axis label width
  const chartWidth = screenWidth - 40 - 32 - 60;

  const maxValue = Math.max(...data.map((d) => d.value));
  const noOfSections = 3;

  const formatValue = (v: number) => formatRublesWithSymbol(v);

  const chartData = data.map((item, index) => ({
    ...item,
    frontColor:
      selectedIndex === index ? colors.primary.blue[500] : colors.neutral[200],
    topLabelComponent:
      selectedIndex === index
        ? () => (
            <View className="bg-neutral-900 rounded-lg px-2 py-1 mb-1 items-center">
              <Typography
                weight="semibold"
                className="text-caption text-neutral-0"
              >
                {formatValue(item.value)}
              </Typography>
            </View>
          )
        : undefined,
    onPress: () => setSelectedIndex((prev) => (prev === index ? null : index)),
  }));

  return (
    <View className="bg-background-surface rounded-base p-[16px] gap-4">
      <View className="flex-row items-center justify-between">
        <Typography className="text-body text-neutral-900">{title}</Typography>

        <View className="relative">
          <TouchableOpacity
            activeOpacity={0.7}
            className="flex-row items-center gap-1"
            onPress={() => setPeriodMenuVisible((v) => !v)}
          >
            <Typography weight="regular" className="text-body text-neutral-500">
              {selectedPeriod.label}
            </Typography>
            <StSvg
              name="Expand_down_light"
              size={16}
              color={colors.neutral[500]}
            />
          </TouchableOpacity>

          {periodMenuVisible && (
            <View className="absolute right-0 top-7 bg-background-surface rounded-small border border-neutral-100 z-10 min-w-[120px]">
              {periods.map((p) => (
                <TouchableOpacity
                  key={p.value}
                  activeOpacity={0.7}
                  className="px-3 py-2"
                  onPress={() => {
                    setSelectedPeriod(p);
                    setPeriodMenuVisible(false);
                  }}
                >
                  <Typography
                    weight={
                      selectedPeriod.value === p.value ? "semibold" : "regular"
                    }
                    className={
                      selectedPeriod.value === p.value
                        ? "text-body text-primary-blue-500"
                        : "text-body text-neutral-700"
                    }
                  >
                    {p.label}
                  </Typography>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>

      <View className="flex-1 min-h-[184px]">
        <BarChart
          data={chartData}
          width={chartWidth}
          yAxisLabelWidth={60}
          height={150}
          barWidth={30}
          barBorderRadius={8}
          barBorderBottomLeftRadius={0}
          barBorderBottomRightRadius={0}
          noOfSections={noOfSections}
          maxValue={Math.ceil(maxValue / 50000) * 50000}
          rulesType="dashed"
          rulesColor={colors.neutral[200]}
          dashWidth={4}
          dashGap={4}
          yAxisSide={1}
          yAxisTextStyle={{
            color: colors.neutral[400],
            fontSize: 13,
            fontFamily: "Inter_400Regular",
          }}
          xAxisLabelTextStyle={{
            color: colors.neutral[400],
            fontSize: 13,
            fontFamily: "Inter_400Regular",
          }}
          hideAxesAndRules={false}
          yAxisThickness={0}
          xAxisThickness={0}
          initialSpacing={8}
          spacing={12}
        />
      </View>
    </View>
  );
};

export default TrendChartCard;
