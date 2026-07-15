import React from "react";
import { View, Pressable } from "react-native";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";

import { RhfDatePicker } from "@/src/components/hookForm/rhf-date-picker";
import { Button } from "@/src/components/ui/Button";
import { StSvg } from "@/src/components/ui/StSvg";
import { Typography } from "@/src/components/ui/Typography";
import { colors } from "@/src/styles/colors";
import { formatTime, parseTimeString } from "@/src/utils/date/formatTime";
import {
  BREAKS_OVERLAP_MESSAGE,
  overlapsOther,
  type BreakItem,
} from "@/src/validation/utils/timeRange";

const MAX_BREAKS = 3;

type Props = {
  name?: string;
  startDefault?: Date;
  endDefault?: Date;
};

export const BreaksFieldArray = ({
  name = "breaks",
  startDefault,
  endDefault,
}: Props) => {
  const { control } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name });
  const breaksValues = (useWatch({ control, name }) ?? []) as BreakItem[];

  const canAddMore = fields.length < MAX_BREAKS;

  const hasOverlap = breaksValues.some((item) =>
    overlapsOther(item, breaksValues),
  );
  const overlapMessage = hasOverlap ? BREAKS_OVERLAP_MESSAGE : undefined;

  return (
    <View>
      {fields.length > 0 && (
        <Typography className="text-caption text-neutral-500 mb-2">
          Перерывы
        </Typography>
      )}

      <View className="gap-2">
        {fields.map((field, index) => (
          <View key={field.id} className="flex-row items-center gap-2">
            <View className="flex-1">
              <RhfDatePicker
                name={`${name}.${index}.start`}
                placeholder="12:00"
                defaultDisplayValue={startDefault}
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
                name={`${name}.${index}.end`}
                placeholder="13:00"
                defaultDisplayValue={endDefault}
                hideErrorText
                parseValue={parseTimeString}
                formatValue={formatTime}
                endAdornment={
                  <StSvg name="Time" size={24} color={colors.neutral[500]} />
                }
              />
            </View>

            <Pressable
              onPress={() => remove(index)}
              className="rounded-full items-center justify-center"
              hitSlop={10}
            >
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

      {overlapMessage && (
        <View className="flex-row items-center gap-1 mt-2">
          <StSvg name="Alarm_fill" size={16} color={colors.accent.red[500]} />
          <Typography
            weight="medium"
            className="text-caption text-accent-red-500"
          >
            {overlapMessage}
          </Typography>
        </View>
      )}

      {!canAddMore && (
        <Typography className="text-caption text-neutral-900 mt-2">
          Можно добавить максимум {MAX_BREAKS} перерыва
        </Typography>
      )}
    </View>
  );
};
