import { useFormContext, Controller } from "react-hook-form";
import { useState, useMemo, useRef } from "react";
import {
  View,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  PanResponder,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Picker } from "@react-native-picker/picker";
import Modal from "react-native-modal";
import { BlurView } from "expo-blur";
import { Input, Button, BottomSheetHandle } from "@/src/components/ui";

const DEFAULT_DURATION_ITEMS = Array.from({ length: 25 }, (_, i) => ({
  label: String(i * 5),
  value: i * 5,
}));

type RHFPickerProps = {
  name: string;
  items?: Array<{ label: string; value: number | string }>;
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
  const { height } = useWindowDimensions();
  const { top, bottom, left, right } = useSafeAreaInsets();
  const handleRef = useRef(null);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        if (gestureState.dy > 50) {
          setModalVisible(false);
          setTempValue(null);
        }
      },
    }),
  ).current;

  const containerStyle = useMemo(
    () => ({
      maxHeight: height - top,
      paddingBottom: bottom + 8,
      paddingLeft: 20 + left,
      paddingRight: 20 + right,
    }),
    [bottom, height, left, right, top],
  );

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
              <Input
                label={label}
                placeholder={placeholder}
                value={selectedItem?.label || ""}
                editable={false}
                pointerEvents="none"
              />
            </Pressable>

            <Modal
              isVisible={modalVisible}
              swipeDirection={undefined}
              onBackdropPress={() => {
                setModalVisible(false);
                setTempValue(null);
              }}
              statusBarTranslucent
              style={[styles.container, { paddingTop: top }]}
            >
              <View
                className="py-3 relative rounded-t-large bg-white/90 overflow-hidden"
                style={containerStyle}
              >
                <BlurView
                  intensity={50}
                  tint="light"
                  style={StyleSheet.absoluteFill}
                />
                <View ref={handleRef} {...panResponder.panHandlers}>
                  <Pressable
                    onPress={() => {
                      setModalVisible(false);
                      setTempValue(null);
                    }}
                  >
                    <BottomSheetHandle />
                  </Pressable>
                </View>

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
                    onPress={() => {
                      setModalVisible(false);
                      setTempValue(null);
                    }}
                  />
                </View>
              </View>
            </Modal>
          </>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 0,
    justifyContent: "flex-end",
  },
});
