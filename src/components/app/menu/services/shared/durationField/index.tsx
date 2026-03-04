import React, { useEffect, useMemo, useState } from "react";
import { View } from "react-native";
import { useController, useFormContext } from "react-hook-form";

import { RhfTextField } from "@/src/components/hookForm/rhf-text-field";
import { Button, Typography } from "@/src/components/ui";

type DurationFieldProps = {
  name?: string;
  label?: string;
  placeholder?: string;
  presets?: (number | string)[];
  customDurationTitle?: string;
};

const defaultPresets: (number | string)[] = [20, 30, 60, 90];

const DurationField = ({
  name = "duration",
  label = "Продолжительность (мин)",
  placeholder = "60",
  presets = defaultPresets,
  customDurationTitle = "Другое время",
}: DurationFieldProps) => {
  const { control } = useFormContext();
  const {
    field: { value, onChange },
  } = useController({ name, control });

  const presetValues = useMemo(
    () => presets.map((preset) => String(preset)),
    [presets],
  );
  const currentValue = String(value ?? "");

  const [isCustomSelected, setIsCustomSelected] = useState<boolean>(
    () => currentValue.length > 0 && !presetValues.includes(currentValue),
  );

  const handlePresetPress = (preset: number | string) => {
    setIsCustomSelected(false);
    onChange(String(preset));
  };

  const handleCustomDurationPress = () => {
    setIsCustomSelected(true);
    onChange("");
  };

  useEffect(() => {
    if (currentValue.length > 0 && !presetValues.includes(currentValue)) {
      setIsCustomSelected(true);
    }
  }, [currentValue, presetValues]);

  return (
    <View className={`gap-2 ${!isCustomSelected && "mb-5"}`}>
      <Typography className="text-neutral-500 text-caption">{label}</Typography>

      <View className="flex-row flex-wrap gap-2">
        {presets.map((preset, index) => (
          <Button
            key={`${preset}-${index}`}
            title={String(preset)}
            buttonClassName="flex-1 border border-neutral-200 rounded-xl px-0"
            size="sm"
            variant={
              !isCustomSelected && currentValue === String(preset)
                ? "primary"
                : "secondary"
            }
            onPress={() => handlePresetPress(preset)}
          />
        ))}
        <Button
          title={customDurationTitle}
          size="sm"
          buttonClassName="border border-neutral-200 rounded-xl"
          variant={isCustomSelected ? "primary" : "secondary"}
          onPress={handleCustomDurationPress}
        />
      </View>

      {isCustomSelected && (
        <RhfTextField
          name={name}
          placeholder={placeholder}
          keyboardType="numeric"
        />
      )}
    </View>
  );
};

export default DurationField;
