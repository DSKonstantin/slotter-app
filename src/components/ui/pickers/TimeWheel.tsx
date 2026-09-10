import React, { memo, useCallback, useMemo, useState } from "react";
import { View, useWindowDimensions } from "react-native";
import WheelPicker, {
  withVirtualized,
} from "@quidone/react-native-wheel-picker";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "@/src/styles/colors";

export const ITEM_HEIGHT = 40;
export const VISIBLE_ITEMS = 5;
export const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;
const SELECTED_TOP = (PICKER_HEIGHT - ITEM_HEIGHT) / 2;
const FADE_HEIGHT = ITEM_HEIGHT * 2;
const FADE_COLOR = colors.background.DEFAULT;

const HOUR_LOOP_REPEAT_COUNT = 15;
const MINUTE_LOOP_REPEAT_COUNT = 7;

const LoopWheelPicker = withVirtualized(WheelPicker);

type WheelOption = { value: number; label: string };

const pad2 = (n: number) => String(n).padStart(2, "0");

const buildLoopedData = (
  items: WheelOption[],
  repeatCount: number,
): WheelOption[] => {
  if (items.length === 0) return [];
  return Array.from({ length: items.length * repeatCount }, (_, i) => ({
    value: i,
    label: items[i % items.length].label,
  }));
};

type WheelColumnProps = {
  align: "left" | "right";
  options: WheelOption[];
  loopedData: WheelOption[];
  loop: boolean;
  value: number;
  onValueChanged: (rawValue: number) => void;
};

const WheelColumn = memo(function WheelColumn({
  align,
  options,
  loopedData,
  loop,
  value,
  onValueChanged,
}: WheelColumnProps) {
  if (options.length === 0) return null;
  const Picker = loop ? LoopWheelPicker : WheelPicker;

  return (
    <Picker
      style={{ flex: 1 }}
      itemHeight={ITEM_HEIGHT}
      visibleItemCount={VISIBLE_ITEMS}
      renderOverlay={null}
      itemTextStyle={
        align === "right"
          ? { textAlign: "right", paddingRight: 20 }
          : { textAlign: "left", paddingLeft: 20 }
      }
      data={loop ? loopedData : options}
      value={value}
      onValueChanged={({ item }) => onValueChanged(item.value)}
    />
  );
});

type TimeWheelProps = {
  options: number[];
  value?: number;
  onChange: (minutes: number) => void;
  loop?: boolean;
};

export const TimeWheel = memo(function TimeWheel({
  options,
  value,
  onChange,
  loop = false,
}: TimeWheelProps) {
  const { width: screenWidth } = useWindowDimensions();
  const pickerWidth = Math.min(320, screenWidth - 64);

  const { hourOptions, minuteOptionsByHour } = useMemo(() => {
    const byHour: Record<number, WheelOption[]> = {};
    const hours: WheelOption[] = [];
    for (const t of options) {
      const h = Math.floor(t / 60);
      const m = t % 60;
      if (!byHour[h]) {
        byHour[h] = [];
        hours.push({ value: h, label: pad2(h) });
      }
      byHour[h].push({ value: m, label: pad2(m) });
    }
    return { hourOptions: hours, minuteOptionsByHour: byHour };
  }, [options]);

  const initial =
    value !== undefined && options.includes(value) ? value : (options[0] ?? 0);
  const [selectedHour, setSelectedHour] = useState(Math.floor(initial / 60));
  const [selectedMinute, setSelectedMinute] = useState(initial % 60);

  const minuteOptions = useMemo(
    () => minuteOptionsByHour[selectedHour] ?? [],
    [minuteOptionsByHour, selectedHour],
  );

  const canonicalMinuteOptions = useMemo(() => {
    if (!loop || hourOptions.length === 0) return [];
    return minuteOptionsByHour[hourOptions[0].value] ?? [];
  }, [loop, hourOptions, minuteOptionsByHour]);

  const loopedHourData = useMemo(
    () => (loop ? buildLoopedData(hourOptions, HOUR_LOOP_REPEAT_COUNT) : []),
    [loop, hourOptions],
  );
  const loopedMinuteData = useMemo(
    () =>
      loop
        ? buildLoopedData(canonicalMinuteOptions, MINUTE_LOOP_REPEAT_COUNT)
        : [],
    [loop, canonicalMinuteOptions],
  );

  const [hourLoopIndex, setHourLoopIndex] = useState(() => {
    const realIndex = Math.max(
      0,
      hourOptions.findIndex((h) => h.value === selectedHour),
    );
    return (
      Math.floor(HOUR_LOOP_REPEAT_COUNT / 2) * hourOptions.length + realIndex
    );
  });
  const [minuteLoopIndex, setMinuteLoopIndex] = useState(() => {
    const realIndex = Math.max(
      0,
      minuteOptions.findIndex((m) => m.value === selectedMinute),
    );
    return (
      Math.floor(MINUTE_LOOP_REPEAT_COUNT / 2) * minuteOptions.length +
      realIndex
    );
  });

  const handleHourChange = useCallback(
    (hour: number) => {
      const nextMinuteOptions = minuteOptionsByHour[hour] ?? [];
      const stillValid = nextMinuteOptions.some(
        (m) => m.value === selectedMinute,
      );
      const nextMinute = stillValid
        ? selectedMinute
        : (nextMinuteOptions[0]?.value ?? 0);
      setSelectedHour(hour);
      setSelectedMinute(nextMinute);
      onChange(hour * 60 + nextMinute);
    },
    [minuteOptionsByHour, selectedMinute, onChange],
  );

  const handleMinuteChange = useCallback(
    (minute: number) => {
      setSelectedMinute(minute);
      onChange(selectedHour * 60 + minute);
    },
    [selectedHour, onChange],
  );

  const handleHourWheelChange = useCallback(
    (raw: number) => {
      if (loop) {
        setHourLoopIndex(raw);
        handleHourChange(hourOptions[raw % hourOptions.length].value);
      } else {
        handleHourChange(raw);
      }
    },
    [loop, hourOptions, handleHourChange],
  );

  const handleMinuteWheelChange = useCallback(
    (raw: number) => {
      if (loop) {
        setMinuteLoopIndex(raw);
        handleMinuteChange(
          canonicalMinuteOptions[raw % canonicalMinuteOptions.length].value,
        );
      } else {
        handleMinuteChange(raw);
      }
    },
    [loop, canonicalMinuteOptions, handleMinuteChange],
  );

  return (
    <View
      style={{ height: PICKER_HEIGHT, width: pickerWidth, alignSelf: "center" }}
      className="mb-4"
    >
      <View
        pointerEvents="none"
        className="absolute left-0 right-0 rounded-base bg-neutral-100/70"
        style={{ top: SELECTED_TOP, height: ITEM_HEIGHT }}
      />
      <View
        style={{ height: PICKER_HEIGHT }}
        className="flex-row overflow-hidden items-center"
      >
        <WheelColumn
          align="right"
          options={hourOptions}
          loopedData={loopedHourData}
          loop={loop}
          value={loop ? hourLoopIndex : selectedHour}
          onValueChanged={handleHourWheelChange}
        />
        <WheelColumn
          align="left"
          options={minuteOptions}
          loopedData={loopedMinuteData}
          loop={loop}
          value={loop ? minuteLoopIndex : selectedMinute}
          onValueChanged={handleMinuteWheelChange}
        />
      </View>
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: FADE_HEIGHT,
        }}
      >
        <LinearGradient
          colors={[FADE_COLOR, `${FADE_COLOR}00`]}
          style={{ flex: 1 }}
        />
      </View>
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: FADE_HEIGHT,
        }}
      >
        <LinearGradient
          colors={[`${FADE_COLOR}00`, FADE_COLOR]}
          style={{ flex: 1 }}
        />
      </View>
    </View>
  );
});
