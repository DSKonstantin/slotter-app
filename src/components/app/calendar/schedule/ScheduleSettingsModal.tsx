import React from "react";
import { View, Pressable, StyleSheet } from "react-native";
import { useFieldArray, useFormContext } from "react-hook-form";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button, Divider, StSvg, Typography } from "@/src/components/ui";
import { RhfDatePicker } from "@/src/components/hookForm/rhf-date-picker";
import { colors } from "@/src/styles/colors";
import { formatTime } from "@/src/utils/date/formatTime";
import { TAB_BAR_HEIGHT } from "@/src/constants/tabs";
import type { CalendarScheduleFormValues } from "@/src/validation/schemas/calendarSchedule.schema";

const MAX_BREAKS = 3;

const parseTimeString = (value: string): Date | null => {
  if (!value) return null;
  const [h, m] = value.split(":").map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  onSave: () => void;
  onHeightChange?: (height: number) => void;
  isLoading?: boolean;
};

const ScheduleSettingsModalContent = ({
  onClose,
  onSave,
  isLoading,
}: Omit<Props, "visible">) => {
  const { control } = useFormContext<CalendarScheduleFormValues>();
  const { fields, append, remove } = useFieldArray({ control, name: "breaks" });

  const canAddMore = fields.length < MAX_BREAKS;

  return (
    <>
      <Typography weight="semibold" className="text-body text-center mb-4">
        Настройки для выбранных дней
      </Typography>

      <Typography className="text-caption text-neutral-500 mb-2">
        Рабочее время
      </Typography>
      <View className="flex-row gap-2 mb-4">
        <View className="flex-1">
          <RhfDatePicker
            name="scheduleStart"
            placeholder="9:00"
            hideErrorText
            parseValue={parseTimeString}
            formatValue={formatTime}
            endAdornment={
              <StSvg name="Time" size={24} color={colors.neutral[500]} />
            }
          />
        </View>
        <View className="w-5 items-center mt-[25px]">
          <Divider />
        </View>
        <View className="flex-1">
          <RhfDatePicker
            name="scheduleEnd"
            placeholder="18:00"
            hideErrorText
            parseValue={parseTimeString}
            formatValue={formatTime}
            endAdornment={
              <StSvg name="Time" size={24} color={colors.neutral[500]} />
            }
          />
        </View>
      </View>

      {fields.length > 0 && (
        <Typography className="text-caption text-neutral-500 mb-2">
          Перерывы
        </Typography>
      )}
      <View className="gap-3 mb-1">
        {fields.map((field, index) => (
          <View key={field.id} className="flex-row items-center gap-2">
            <View className="flex-1">
              <RhfDatePicker
                name={`breaks.${index}.start`}
                placeholder="12:00"
                hideErrorText
                parseValue={parseTimeString}
                formatValue={formatTime}
                endAdornment={
                  <StSvg name="Time" size={24} color={colors.neutral[500]} />
                }
              />
            </View>
            <View className="flex-1">
              <RhfDatePicker
                name={`breaks.${index}.end`}
                placeholder="13:00"
                hideErrorText
                parseValue={parseTimeString}
                formatValue={formatTime}
                endAdornment={
                  <StSvg name="Time" size={24} color={colors.neutral[500]} />
                }
              />
            </View>
            <Pressable onPress={() => remove(index)} hitSlop={10}>
              <View className="bg-accent-red-500 items-center justify-center rounded-full w-[36px] h-[36px]">
                <StSvg
                  name="Close_square"
                  size={28}
                  color={colors.neutral[0]}
                />
              </View>
            </Pressable>
          </View>
        ))}
      </View>

      {canAddMore && (
        <Button
          title="Добавить перерыв"
          variant="clear"
          onPress={() => append({ start: "", end: "" })}
          rightIcon={
            <StSvg
              name="Add_round_fill"
              size={24}
              color={colors.neutral[900]}
            />
          }
        />
      )}

      <Typography className="text-caption text-neutral-400 mt-3 mb-4">
        Будет применено ко всем выбранным дням
      </Typography>

      <Button
        title="Сохранить расписание"
        loading={isLoading}
        disabled={isLoading}
        rightIcon={
          <StSvg name="Save_fill" size={24} color={colors.neutral[0]} />
        }
        onPress={onSave}
      />
    </>
  );
};

export const ScheduleSettingsModal = ({
  visible,
  onClose,
  onSave,
  onHeightChange,
  isLoading,
}: Props) => {
  const { bottom, left, right } = useSafeAreaInsets();

  if (!visible) return null;

  return (
    <View
      pointerEvents="box-none"
      onLayout={(e) => onHeightChange?.(e.nativeEvent.layout.height)}
      style={[
        styles.sheet,
        {
          paddingBottom: TAB_BAR_HEIGHT + bottom + 16,
          marginLeft: left + 20,
          marginRight: right + 20,
        },
      ]}
    >
      <BlurView intensity={50} tint="light" style={StyleSheet.absoluteFill} />
      <ScheduleSettingsModalContent
        onClose={onClose}
        onSave={onSave}
        isLoading={isLoading}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingTop: 12,
    paddingBottom: 20,
    paddingHorizontal: 20,
    overflow: "hidden",
  },
  handle: {
    width: 83,
    height: 4,
    borderRadius: 36,
    backgroundColor: "#78788029",
    alignSelf: "center",
    marginBottom: 12,
  },
});
