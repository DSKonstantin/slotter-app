import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import { View } from "react-native";
import WheelPicker from "@quidone/react-native-wheel-picker";

import { Button, StModal, Typography } from "@/src/components/ui";
import { formatTime } from "./utils";

export type FreeSlotRange = {
  start: number;
  end: number;
};

type FreeSlotStartModalProps = {
  visible: boolean;
  range: FreeSlotRange | null;
  onClose: () => void;
  onNext?: (start: number) => void;
};

const STEP_MINUTES = 15;

const roundUpToStep = (value: number) =>
  Math.ceil(value / STEP_MINUTES) * STEP_MINUTES;

const createTimeOptions = (range: FreeSlotRange | null) => {
  if (!range) return [];

  const end = Math.max(range.start, range.end);
  const firstAligned = roundUpToStep(range.start);

  const options: number[] = [range.start];

  for (let time = firstAligned; time <= end; time += STEP_MINUTES) {
    if (time !== range.start) {
      options.push(time);
    }
  }

  return options;
};

const FreeSlotStartModal = ({
  visible,
  range,
  onClose,
  onNext,
}: FreeSlotStartModalProps) => {
  const timeOptions = useMemo(() => createTimeOptions(range), [range]);

  const defaultTime = timeOptions[0] ?? 0;

  const [selectedHour, setSelectedHour] = useState(
    Math.floor(defaultTime / 60),
  );

  const [selectedMinute, setSelectedMinute] = useState(defaultTime % 60);

  const hourOptions = useMemo(() => {
    const hours = Array.from(
      new Set(timeOptions.map((time) => Math.floor(time / 60))),
    );

    return hours.map((hour) => ({
      value: hour,
      label: formatTime(hour * 60),
    }));
  }, [timeOptions]);

  const minuteOptions = useMemo(
    () =>
      timeOptions
        .filter((time) => Math.floor(time / 60) === selectedHour)
        .map((time) => ({
          value: time % 60,
          label: String(time % 60).padStart(2, "0"),
        })),
    [selectedHour, timeOptions],
  );

  useEffect(() => {
    if (!visible) return;

    setSelectedHour(Math.floor(defaultTime / 60));
    setSelectedMinute(defaultTime % 60);
  }, [defaultTime, visible]);

  useEffect(() => {
    if (!minuteOptions.length) return;

    const exists = minuteOptions.some((item) => item.value === selectedMinute);

    if (!exists) {
      setSelectedMinute(minuteOptions[0].value);
    }
  }, [minuteOptions, selectedMinute]);

  const handleNext = useCallback(() => {
    onNext?.(selectedHour * 60 + selectedMinute);
    onClose();
  }, [onClose, onNext, selectedHour, selectedMinute]);

  return (
    <StModal
      visible={visible}
      onClose={onClose}
      swipeDirection={undefined}
      header={
        <Typography weight="semibold" className="text-display text-center mb-6">
          Выбрать начало слота
        </Typography>
      }
      footer={<Button title="Далее" onPress={handleNext} />}
    >
      <View className="mb-6">
        <View className="h-[120px] flex-row items-center justify-center rounded-large bg-neutral-0 overflow-hidden">
          {hourOptions.length > 0 && (
            <WheelPicker
              style={{
                flex: 1,
              }}
              renderOverlay={null}
              data={hourOptions}
              value={selectedHour}
              onValueChanged={({ item }) => {
                setSelectedHour(item.value);
              }}
            />
          )}

          <Typography
            weight="regular"
            className="mx-4 text-[32px] text-neutral-900"
          >
            :
          </Typography>
          {minuteOptions.length > 0 && (
            <WheelPicker
              style={{
                flex: 1,
              }}
              renderOverlay={null}
              data={minuteOptions}
              value={selectedMinute}
              onValueChanged={({ item }) => {
                setSelectedMinute(item.value);
              }}
            />
          )}
        </View>
      </View>
    </StModal>
  );
};

export default memo(FreeSlotStartModal);
