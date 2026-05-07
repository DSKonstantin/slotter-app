import { useController, useFormContext } from "react-hook-form";
import { useState } from "react";
import { View, Pressable, Platform, FlatList } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Button, StModal, Typography } from "@/src/components/ui";
import { BaseField } from "@/src/components/ui/fields/BaseField";
import { colors } from "@/src/styles/colors";
import { useComposedFieldRef } from "@/src/hooks/useScrollToError";

type PickerItem = { label: string; value: number | string };

const buildDurationItems = (): PickerItem[] =>
  Array.from({ length: 61 }, (_, i) => ({
    label: String(i * 5),
    value: i * 5,
  }));

type RHFPickerProps = {
  name: string;
  items?: PickerItem[];
  defaultValue?: number | string | null;
  label?: string;
  placeholder?: string;
  unit?: string;
  onChange?: (value: number | string) => void;
};

export default function RHFPicker({
  name,
  items,
  defaultValue,
  label,
  placeholder,
  onChange,
}: RHFPickerProps) {
  const resolvedItems = items ?? buildDurationItems();
  const { control } = useFormContext();
  const {
    field,
    fieldState: { error },
  } = useController({ name, control, defaultValue: defaultValue ?? null });
  const setRef = useComposedFieldRef(name, field.ref);
  const [modalVisible, setModalVisible] = useState(false);
  const [tempValue, setTempValue] = useState<number | string | null>(null);

  const handleClose = () => {
    setModalVisible(false);
    setTempValue(null);
  };

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
      <BaseField
        ref={setRef}
        label={label}
        error={error}
        renderControl={() => (
          <Pressable
            onPress={() => {
              setTempValue(field.value ?? resolvedItems[0]?.value ?? null);
              setModalVisible(true);
            }}
            className="flex-1 px-4 justify-center min-h-[48px]"
          >
            <Typography
              className="text-body"
              style={{
                color:
                  field.value !== null && field.value !== undefined
                    ? colors.neutral[900]
                    : colors.neutral[300],
              }}
            >
              {field.value !== null && field.value !== undefined
                ? String(field.value)
                : placeholder || ""}
            </Typography>
          </Pressable>
        )}
      />

      <StModal
        visible={modalVisible}
        onClose={handleClose}
        swipeDirection={undefined}
      >
        <View>
          {Platform.OS === "ios" ? (
            <Picker
              selectedValue={tempValue ?? field.value}
              onValueChange={(value) => setTempValue(value)}
            >
              {resolvedItems.map((item) => (
                <Picker.Item
                  key={item.value}
                  label={String(item.label)}
                  value={item.value}
                />
              ))}
            </Picker>
          ) : (
            <FlatList
              data={resolvedItems}
              keyExtractor={(item) => String(item.value)}
              style={{ maxHeight: 180 }}
              showsVerticalScrollIndicator={false}
              initialScrollIndex={Math.max(
                0,
                resolvedItems.findIndex(
                  (item) => item.value === (tempValue ?? field.value),
                ),
              )}
              getItemLayout={(_, index) => ({
                length: 48,
                offset: 48 * index,
                index,
              })}
              renderItem={({ item }) => {
                const isSelected = item.value === (tempValue ?? field.value);
                return (
                  <Pressable
                    onPress={() => setTempValue(item.value)}
                    className="h-[48px] items-center justify-center px-4 rounded-small active:opacity-70"
                    style={{
                      backgroundColor: isSelected
                        ? colors.background.surface
                        : "transparent",
                    }}
                  >
                    <Typography
                      className="text-body text-center"
                      style={{
                        color: isSelected
                          ? colors.neutral[900]
                          : colors.neutral[500],
                      }}
                    >
                      {item.label}
                    </Typography>
                  </Pressable>
                );
              }}
            />
          )}
        </View>

        <View className="gap-3 mt-4">
          <Button title="Готово" onPress={handleConfirm} />
          <Button title="Отмена" variant="secondary" onPress={handleClose} />
        </View>
      </StModal>
    </>
  );
}
