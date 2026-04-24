import { useFormContext, Controller } from "react-hook-form";
import { useState } from "react";
import { View, Pressable } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Button, StModal, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";

const DEFAULT_DURATION_ITEMS = Array.from({ length: 61 }, (_, i) => ({
  label: String(i * 5),
  value: i * 5,
}));

type RHFPickerProps = {
  name: string;
  items?: { label: string; value: number | string }[];
  defaultValue?: number | string;
  label?: string;
  placeholder?: string;
  onChange?: (value: number | string) => void;
};

export default function RHFPicker({
  name,
  items = DEFAULT_DURATION_ITEMS,
  defaultValue = items[0]?.value,
  label,
  placeholder,
  onChange,
}: RHFPickerProps) {
  const { control } = useFormContext();
  const [modalVisible, setModalVisible] = useState(false);
  const [tempValue, setTempValue] = useState<number | string | null>(null);

  const handleClose = () => {
    setModalVisible(false);
    setTempValue(null);
  };

  return (
    <Controller
      name={name}
      control={control}
      defaultValue={defaultValue}
      render={({ field }) => {
        const selectedItem = items.find((item) => item.value === field.value);

        const handleConfirm = () => {
          if (tempValue !== null) {
            field.onChange(tempValue);
            onChange?.(tempValue);
          }
          setModalVisible(false);
          setTempValue(null);
        };

        return (
          <>
            <Pressable
              onPress={() => {
                setTempValue(field.value);
                setModalVisible(true);
              }}
            >
              {label && (
                <Typography
                  weight="medium"
                  className="text-caption text-neutral-500 mb-2"
                >
                  {label}
                </Typography>
              )}
              <View className="flex-row items-center rounded-small bg-background-surface min-h-[48px] px-4">
                <Typography
                  className="text-body flex-1"
                  style={{
                    color: selectedItem
                      ? colors.neutral[900]
                      : colors.neutral[300],
                  }}
                >
                  {selectedItem?.label || placeholder || ""}
                </Typography>
              </View>
            </Pressable>

            <StModal
              visible={modalVisible}
              onClose={handleClose}
              swipeDirection={undefined}
            >
              <View>
                <Picker
                  selectedValue={tempValue ?? field.value}
                  onValueChange={(value) => {
                    setTempValue(value);
                  }}
                >
                  {items.map((item) => (
                    <Picker.Item
                      key={item.value}
                      label={String(item.label)}
                      value={item.value}
                    />
                  ))}
                </Picker>
              </View>

              <View className="gap-3 mt-4">
                <Button title="Готово" onPress={handleConfirm} />
                <Button
                  title="Отмена"
                  variant="secondary"
                  onPress={handleClose}
                />
              </View>
            </StModal>
          </>
        );
      }}
    />
  );
}
