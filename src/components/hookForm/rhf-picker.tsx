import { useController, useFormContext } from "react-hook-form";
import { useState } from "react";
import { Platform, View, Pressable, TextInput } from "react-native";
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

  if (Platform.OS === "android") {
    return (
      <BaseField
        ref={setRef}
        label={label}
        error={error}
        renderControl={() => (
          <TextInput
            value={field.value != null ? String(field.value) : ""}
            onChangeText={(text) => {
              const num = parseInt(text, 10);
              const val = isNaN(num) ? null : num;
              field.onChange(val);
              if (val !== null) onChange?.(val);
            }}
            onBlur={field.onBlur}
            keyboardType="numeric"
            placeholder={placeholder}
            placeholderTextColor={colors.neutral[300]}
            className="flex-1 px-4 min-h-[48px] text-body"
            style={{ color: colors.neutral[900] }}
          />
        )}
      />
    );
  }

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
        </View>

        <View className="gap-3 mt-4">
          <Button title="Готово" onPress={handleConfirm} />
          <Button title="Отмена" variant="secondary" onPress={handleClose} />
        </View>
      </StModal>
    </>
  );
}
