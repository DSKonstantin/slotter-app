import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import { FieldError } from "react-hook-form";
import {
  ActivityIndicator,
  Pressable,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import WheelPicker from "@quidone/react-native-wheel-picker";
import { LinearGradient } from "expo-linear-gradient";
import { BaseField } from "@/src/components/ui/fields/BaseField";
import { StModal } from "@/src/components/ui/StModal";
import { StSvg } from "@/src/components/ui/StSvg";
import { Button, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import { formatMinutes, parseTime } from "@/src/utils/date/formatTime";

const STEP = 5;
const ITEM_HEIGHT = 40;
const VISIBLE_ITEMS = 5;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;
const SELECTED_TOP = (PICKER_HEIGHT - ITEM_HEIGHT) / 2;
const FADE_HEIGHT = ITEM_HEIGHT * 2;
const FADE_COLOR = colors.background.DEFAULT;
// 20 × up to 12 items/hour = up to 240 items; center is ~120 swipes from either edge
const LOOP_COUNT = 1;

export type Break = { startMinutes: number; endMinutes: number };

type MinuteOption = { value: number; label: string };
type LoopedItem = { value: number; label: string };
type HourData = { options: MinuteOption[]; looped: LoopedItem[] };

type PickerProps = {
  timeOptions: number[];
  hourOptions: { value: number; label: string }[];
  minuteDataPerHour: Record<number, HourData>;
  valueMinutes?: number;
  onPick: (time: string) => void;
  onCancel: () => void;
};

const TimePicker = memo(function TimePicker({
  timeOptions,
  hourOptions,
  minuteDataPerHour,
  valueMinutes,
  onPick,
  onCancel,
}: PickerProps) {
  const initialTime = useMemo(() => {
    if (valueMinutes !== undefined && timeOptions.includes(valueMinutes)) {
      return valueMinutes;
    }
    return timeOptions[0] ?? 0;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [selectedHour, setSelectedHour] = useState(
    Math.floor(initialTime / 60),
  );
  const [selectedMinute, setSelectedMinute] = useState(initialTime % 60);

  // minuteOptions and loopedMinuteData are plain derived values (not hooks),
  // so they're safe to reference in the useState initializer below.
  const minuteOptions = minuteDataPerHour[selectedHour]?.options ?? [];
  const loopedMinuteData = minuteDataPerHour[selectedHour]?.looped ?? [];

  const [minutePickerIndex, setMinutePickerIndex] = useState(() => {
    const pos = Math.max(
      0,
      minuteOptions.findIndex((m) => m.value === initialTime % 60),
    );
    return Math.floor(LOOP_COUNT / 2) * minuteOptions.length + pos;
  });

  useEffect(() => {
    if (!minuteOptions.length) return;
    let cur = selectedMinute;
    if (!minuteOptions.some((m) => m.value === cur)) {
      cur = minuteOptions[0].value;
      setSelectedMinute(cur);
    }
    const pos = Math.max(
      0,
      minuteOptions.findIndex((m) => m.value === cur),
    );
    setMinutePickerIndex(
      Math.floor(LOOP_COUNT / 2) * minuteOptions.length + pos,
    );
  }, [minuteOptions]); // eslint-disable-line react-hooks/exhaustive-deps

  const { width: screenWidth } = useWindowDimensions();
  const pickerWidth = Math.min(320, screenWidth - 64);

  const handleConfirm = useCallback(() => {
    onPick(formatMinutes(selectedHour * 60 + selectedMinute));
  }, [onPick, selectedHour, selectedMinute]);

  return (
    <View>
      <View
        style={{
          height: PICKER_HEIGHT,
          width: pickerWidth,
          alignSelf: "center",
        }}
        className="mb-4"
      >
        {/* highlight behind pickers so item text renders on top */}
        <View
          pointerEvents="none"
          className="absolute left-0 right-0 rounded-base bg-neutral-100/70"
          style={{ top: SELECTED_TOP, height: ITEM_HEIGHT }}
        />
        <View
          style={{ height: PICKER_HEIGHT }}
          className="flex-row overflow-hidden items-center"
        >
          {hourOptions.length > 0 && (
            <WheelPicker
              style={{ flex: 1 }}
              itemHeight={ITEM_HEIGHT}
              visibleItemCount={VISIBLE_ITEMS}
              renderOverlay={null}
              itemTextStyle={{ textAlign: "right", paddingRight: 20 }}
              data={hourOptions}
              value={selectedHour}
              onValueChanged={({ item }) => setSelectedHour(item.value)}
            />
          )}
          {loopedMinuteData.length > 0 && (
            <WheelPicker
              style={{ flex: 1 }}
              itemHeight={ITEM_HEIGHT}
              visibleItemCount={VISIBLE_ITEMS}
              renderOverlay={null}
              itemTextStyle={{ textAlign: "left", paddingLeft: 20 }}
              data={loopedMinuteData}
              value={Math.min(minutePickerIndex, loopedMinuteData.length - 1)}
              onValueChanged={({ item }) => {
                setMinutePickerIndex(item.value);
                setSelectedMinute(
                  minuteOptions[item.value % minuteOptions.length].value,
                );
              }}
            />
          )}
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

      <Button title="Готово" onPress={handleConfirm} />
      <Pressable className="items-center py-3 mt-1" onPress={onCancel}>
        <Typography weight="medium" className="text-body text-neutral-900">
          Отмена
        </Typography>
      </Pressable>
    </View>
  );
});

type Props = {
  value: string | null;
  onChange: (time: string) => void;
  label?: string;
  error?: FieldError;
  startMinutes?: number;
  endMinutes?: number;
  breaks?: Break[];
  isLoading?: boolean;
};

export const WorkingDayTimePickerField = ({
  value,
  onChange,
  label,
  error,
  startMinutes,
  endMinutes,
  breaks = [],
  isLoading,
}: Props) => {
  const [open, setOpen] = useState(false);
  const disabled =
    isLoading || startMinutes === undefined || endMinutes === undefined;

  // All heavy data is pre-computed here when working day loads,
  // so TimePicker has nothing to compute when the modal opens.
  const timeOptions = useMemo(() => {
    if (startMinutes === undefined || endMinutes === undefined) return [];
    const options: number[] = [];
    const firstAligned = Math.ceil(startMinutes / STEP) * STEP;
    if (startMinutes % STEP !== 0) options.push(startMinutes);
    for (let t = firstAligned; t <= endMinutes; t += STEP) options.push(t);
    return options.filter(
      (t) => !breaks.some((b) => t >= b.startMinutes && t < b.endMinutes),
    );
  }, [startMinutes, endMinutes, breaks]);

  const hourOptions = useMemo(() => {
    const hours = Array.from(
      new Set(timeOptions.map((t) => Math.floor(t / 60))),
    );
    return hours.map((h) => ({ value: h, label: String(h).padStart(2, "0") }));
  }, [timeOptions]);

  const minuteDataPerHour = useMemo(() => {
    const map: Record<number, HourData> = {};
    for (const { value: h } of hourOptions) {
      const options = timeOptions
        .filter((t) => Math.floor(t / 60) === h)
        .map((t) => ({
          value: t % 60,
          label: String(t % 60).padStart(2, "0"),
        }));
      const looped = Array.from(
        { length: options.length * LOOP_COUNT },
        (_, i) => ({
          value: i,
          label: options[i % options.length].label,
        }),
      );
      map[h] = { options, looped };
    }
    return map;
  }, [timeOptions, hourOptions]);

  return (
    <View>
      <BaseField
        label={label}
        error={error}
        endAdornment={
          isLoading ? (
            <ActivityIndicator size="small" color={colors.neutral[500]} />
          ) : (
            <StSvg name="Time_light" size={24} color={colors.neutral[500]} />
          )
        }
        renderControl={() => (
          <Pressable
            className="flex-1 justify-center"
            disabled={disabled}
            onPress={() => !disabled && setOpen(true)}
          >
            <Text
              className="font-inter-regular text-[16px] px-4"
              style={{
                color: value ? colors.neutral[900] : colors.neutral[300],
              }}
            >
              {value || "чч:мм"}
            </Text>
          </Pressable>
        )}
      />
      <StModal
        visible={open}
        onClose={() => setOpen(false)}
        swipeDirection={undefined}
      >
        <Typography
          weight="semibold"
          className="text-display text-neutral-900 mb-4 text-center"
        >
          Выберите время
        </Typography>
        {!disabled && (
          <TimePicker
            key={`${startMinutes}-${endMinutes}`}
            timeOptions={timeOptions}
            hourOptions={hourOptions}
            minuteDataPerHour={minuteDataPerHour}
            valueMinutes={value ? parseTime(value) : undefined}
            onPick={(time) => {
              onChange(time);
              setOpen(false);
            }}
            onCancel={() => setOpen(false)}
          />
        )}
      </StModal>
    </View>
  );
};
