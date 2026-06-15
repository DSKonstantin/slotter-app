import React, { useMemo, useState } from "react";
import { View } from "react-native";
import { useController, useFormContext } from "react-hook-form";

import { RhfDurationPicker } from "@/src/components/hookForm/rhf-duration-picker";
import { Button, Typography } from "@/src/components/ui";

type DurationFieldProps = {
  name?: string;
  label?: string;
  placeholder?: string;
  presets?: (number | string)[];
  customDurationTitle?: string;
};

const defaultPresets: (number | string)[] = [0, 30, 60, 90];

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

  const currentValue = String(value ?? "");

  const [isCustomSelected, setIsCustomSelected] = useState<boolean>(() => {
    const presetStrings = presets.map((preset) => String(preset));
    return (
      currentValue.length > 0 &&
      currentValue !== "0" &&
      !presetStrings.includes(currentValue)
    );
  });

  const presetValues = useMemo(
    () => presets.map((preset) => String(preset)),
    [presets],
  );

  const handlePresetPress = (preset: number | string) => {
    setIsCustomSelected(false);
    onChange(String(preset));
  };

  const handleCustomDurationPress = () => {
    setIsCustomSelected(true);
    onChange("");
  };

  return (
    <View className={`gap-2 ${!isCustomSelected && "mb-5"}`}>
      <Typography className="text-neutral-500 text-caption">{label}</Typography>

      <View className="flex-row flex-wrap gap-2">
        {presets.map((preset, index) => (
          <Button
            key={`${preset}-${index}`}
            title={String(preset)}
            buttonClassName="border border-neutral-200 rounded-xl"
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
        <RhfDurationPicker name={name} placeholder={placeholder} />
      )}
    </View>
  );
};

export default DurationField;
