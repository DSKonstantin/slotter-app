import { useController, useFormContext } from "react-hook-form";
import { useState } from "react";
import { Platform, View, Pressable } from "react-native";
import { Picker } from "@react-native-picker/picker";
import RNDateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
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

const minutesToDate = (minutes: number | null): Date => {
  const m = typeof minutes === "number" ? minutes : 0;
  return new Date(0, 0, 0, Math.floor(m / 60), m % 60);
};

const dateToMinutes = (date: Date): number =>
  date.getHours() * 60 + date.getMinutes();

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

  const handleAndroidChange = (event: DateTimePickerEvent, selected?: Date) => {
    setModalVisible(false);
    if (event.type === "set" && selected) {
      const minutes = dateToMinutes(selected);
      field.onChange(minutes);
      onChange?.(minutes);
    }
  };

  const currentMinutes = typeof field.value === "number" ? field.value : null;

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

      {Platform.OS === "android" && modalVisible && (
        <RNDateTimePicker
          value={minutesToDate(currentMinutes)}
          mode="time"
          display="spinner"
          is24Hour
          minuteInterval={5}
          themeVariant="light"
          onChange={handleAndroidChange}
        />
      )}

      {Platform.OS === "ios" && (
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
      )}
    </>
  );
}
