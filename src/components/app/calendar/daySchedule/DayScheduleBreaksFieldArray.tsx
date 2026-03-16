import React from "react";
import { View, Pressable } from "react-native";
import { useFieldArray, useFormContext } from "react-hook-form";

import { RhfDatePicker } from "@/src/components/hookForm/rhf-date-picker";
import { Button, StSvg, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import { formatTime } from "@/src/utils/date/formatTime";

const MAX_BREAKS = 3;

const parseTimeString = (value: string): Date | null => {
  if (!value) return null;
  const [h, m] = value.split(":").map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
};

type Props = {
  name?: string;
};

export const DayScheduleBreaksFieldArray = ({ name = "breaks" }: Props) => {
  const { control } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name });

  const canAddMore = fields.length < MAX_BREAKS;

  return (
    <View className="mt-2 gap-3">
      {fields.length > 0 && (
        <Typography className="text-caption text-neutral-500">
          Перерывы
        </Typography>
      )}

      <View className="gap-3">
        {fields.map((field, index) => (
          <View key={field.id} className="flex-row items-center gap-2">
            <View className="flex-1">
              <RhfDatePicker
                name={`${name}.${index}.start`}
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
                name={`${name}.${index}.end`}
                placeholder="13:00"
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

      {!canAddMore && (
        <Typography className="text-caption text-neutral-900">
          Можно добавить максимум {MAX_BREAKS} перерыва
        </Typography>
      )}
    </View>
  );
};
