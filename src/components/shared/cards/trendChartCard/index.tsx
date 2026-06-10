import React, { useRef, useState } from "react";
import {
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  useWindowDimensions,
} from "react-native";
import { BarChart } from "react-native-gifted-charts";
import { StSvg, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import {
  centsToRubles,
  formatRublesWithSymbol,
} from "@/src/utils/price/formatPrice";

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
  onPeriodChange?: (period: Period) => void;
};

const TrendChartCard = ({
  title = "Динамика",
  data = [],
  periods = [],
  onPeriodChange,
}: Props) => {
  const [selectedPeriod, setSelectedPeriod] = useState(periods[0]);
  const [periodMenuVisible, setPeriodMenuVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const { width: screenWidth } = useWindowDimensions();
  const triggerRef = useRef<View>(null);

  const chartWidth = screenWidth - 40 - 32 - 80;

  const maxRubles =
    data.length > 0 ? Math.max(...data.map((d) => centsToRubles(d.value))) : 0;
  const noOfSections = 3;

  const rubleData = data.map((item) => ({
    ...item,
    value: centsToRubles(item.value),
  }));

  const chartData = rubleData.map((item, index) => ({
    ...item,
    frontColor:
      selectedIndex === index ? colors.neutral[900] : colors.neutral[200],
    topLabelContainerStyle: {
      justifyContent: "center" as const,
      width: 80,
      top: -15,
      backgroundColor: colors.neutral[900],
      right: -82,
      borderTopRightRadius: 8,
      borderTopLeftRadius: 8,
      borderBottomLeftRadius: 2,
      borderBottomRightRadius: 8,
    },
    topLabelComponent:
      selectedIndex === index && item.value !== 0
        ? () => (
            <Typography
              weight="semibold"
              className="text-caption text-neutral-0"
              numberOfLines={1}
            >
              {formatRublesWithSymbol(item.value)}
            </Typography>
          )
        : undefined,
    onPress: () => setSelectedIndex((prev) => (prev === index ? null : index)),
  }));

  const openMenu = () => {
    triggerRef.current?.measure(
      (
        _x: number,
        _y: number,
        width: number,
        height: number,
        pageX: number,
        pageY: number,
      ) => {
        setMenuPosition({
          top: pageY + height + 4,
          right: screenWidth - pageX - width,
        });
        setPeriodMenuVisible(true);
      },
    );
  };

  return (
    <View className="bg-background-surface rounded-base p-[16px] gap-4">
      <View className="flex-row items-center justify-between gap-2">
        <Typography className="text-body text-neutral-900 flex-1 flex-shrink">
          {title}
        </Typography>

        {periods.length > 0 && selectedPeriod && (
          <TouchableOpacity
            ref={triggerRef as React.RefObject<View>}
            activeOpacity={0.7}
            className="flex-row items-center gap-1"
            onPress={openMenu}
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
        )}
      </View>

      <View className="flex-1 min-h-[184px]">
        {data.length === 0 ? (
          <View className="flex-1 items-center justify-center min-h-[150px]">
            <Typography className="text-body text-neutral-400">
              Нет данных
            </Typography>
          </View>
        ) : (
          <BarChart
            data={chartData}
            width={chartWidth}
            yAxisLabelWidth={60}
            height={150}
            overflowTop={48}
            barWidth={30}
            barBorderRadius={8}
            barBorderBottomLeftRadius={0}
            barBorderBottomRightRadius={0}
            noOfSections={noOfSections}
            maxValue={Math.ceil(maxRubles / 5000) * 5000}
            formatYLabel={(v) => formatRublesWithSymbol(Number(v))}
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
        )}
      </View>

      <Modal
        visible={periodMenuVisible}
        transparent
        animationType="none"
        onRequestClose={() => setPeriodMenuVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setPeriodMenuVisible(false)}>
          <View className="flex-1">
            <View
              className="absolute bg-background-surface rounded-small border border-neutral-100 min-w-[120px]"
              style={{ top: menuPosition.top, right: menuPosition.right }}
            >
              {periods.map((p) => (
                <TouchableOpacity
                  key={p.value}
                  activeOpacity={0.7}
                  className="px-3 py-2"
                  onPress={() => {
                    setSelectedPeriod(p);
                    setPeriodMenuVisible(false);
                    onPeriodChange?.(p);
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
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

export default TrendChartCard;
