import React from "react";
import { View, Pressable } from "react-native";
import { useFieldArray, useFormContext } from "react-hook-form";

import { RhfDatePicker } from "@/src/components/hookForm/rhf-date-picker";
import { Button, StSvg, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";

const MAX_BREAKS = 2;

// import type { ScheduleFormValues } from "./Schedule";

export const BreaksFieldArray = () => {
  const { control } = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "breaks",
  });

  const addBreak = () => {
    if (fields.length >= MAX_BREAKS) return;

    append({
      from: null,
      to: null,
    });
  };

  const canAddMore = fields.length < MAX_BREAKS;

  return (
    <View className="mt-2 gap-3">
      {fields.length > 0 && (
        <Typography weight="medium" className="text-caption text-neutral-500">
          Перерывы
        </Typography>
      )}

      <View className="gap-3">
        {fields.map((field, index) => (
          <View key={field.id} className="flex-row items-center gap-2">
            <View className="flex-1">
              <RhfDatePicker
                name={`breaks.${index}.from`}
                placeholder="12:00"
                hideErrorText
                endAdornment={
                  <StSvg name="Time" size={24} color={colors.neutral[500]} />
                }
              />
            </View>

            <View className="flex-1">
              <RhfDatePicker
                name={`breaks.${index}.to`}
                placeholder="13:00"
                hideErrorText
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
          onPress={addBreak}
          iconRight={
            <StSvg
              name="Add_round_fill"
              size={24}
              color={colors.neutral[900]}
            />
          }
        />
      )}

      {!canAddMore && (
        <Typography weight="medium" className="text-caption text-neutral-900">
          Можно добавить максимум 2 перерыва
        </Typography>
      )}
    </View>
  );
};
