import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { View, useWindowDimensions } from "react-native";
import WheelPicker from "@quidone/react-native-wheel-picker";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { Button, StModal, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import { pluralize } from "@/src/utils/text/pluralize";

const ITEM_HEIGHT = 40;
const VISIBLE_ITEMS = 5;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;
const SELECTED_TOP = (PICKER_HEIGHT - ITEM_HEIGHT) / 2;
const FADE_HEIGHT = ITEM_HEIGHT * 2;
const FADE_COLOR = colors.background.DEFAULT;
const HAPTIC_THROTTLE_MS = 30;

const MIN_DAYS = 1;
const MAX_DAYS = 365;

const DAY_OPTIONS = Array.from({ length: MAX_DAYS - MIN_DAYS + 1 }, (_, i) => {
  const value = MIN_DAYS + i;
  return {
    value,
    label: `${value} ${pluralize(value, ["день", "дня", "дней"])}`,
  };
});

type RebookDaysPickerModalProps = {
  visible: boolean;
  value: number;
  onConfirm: (days: number) => void;
  onClose: () => void;
};

const RebookDaysPickerModal = ({
  visible,
  value,
  onConfirm,
  onClose,
}: RebookDaysPickerModalProps) => {
  const [draft, setDraft] = useState(value);
  const wasVisible = useRef(visible);
  const lastHapticRef = useRef(0);

  useEffect(() => {
    const justOpened = visible && !wasVisible.current;
    wasVisible.current = visible;
    if (justOpened) setDraft(value);
  }, [visible, value]);

  const { width: screenWidth } = useWindowDimensions();
  const pickerWidth = useMemo(
    () => Math.min(320, screenWidth - 64),
    [screenWidth],
  );

  const handleValueChanging = useCallback(() => {
    const now = Date.now();
    if (now - lastHapticRef.current < HAPTIC_THROTTLE_MS) return;
    lastHapticRef.current = now;
    void Haptics.selectionAsync();
  }, []);

  return (
    <StModal
      visible={visible}
      onClose={onClose}
      swipeDirection={undefined}
      headerCloseButton
      header={
        <Typography
          weight="semibold"
          className="text-display text-neutral-900 text-center mb-4"
        >
          Выберите продолжительность
        </Typography>
      }
      footer={
        <View className="gap-3">
          <Button title="Готово" onPress={() => onConfirm(draft)} />
          <Button title="Отмена" variant="clear" onPress={onClose} />
        </View>
      }
    >
      <View
        style={{
          height: PICKER_HEIGHT,
          width: pickerWidth,
          alignSelf: "center",
        }}
        className="mb-4"
      >
        <View
          pointerEvents="none"
          className="absolute left-0 right-0 rounded-base bg-neutral-100/70"
          style={{ top: SELECTED_TOP, height: ITEM_HEIGHT }}
        />
        <WheelPicker
          style={{ height: PICKER_HEIGHT }}
          itemHeight={ITEM_HEIGHT}
          visibleItemCount={VISIBLE_ITEMS}
          renderOverlay={null}
          data={DAY_OPTIONS}
          value={draft}
          onValueChanging={handleValueChanging}
          onValueChanged={({ item }) => setDraft(item.value)}
        />
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: FADE_HEIGHT,
          }}
        >
          <LinearGradient
            colors={[FADE_COLOR, `${FADE_COLOR}00`]}
            style={{ flex: 1 }}
          />
        </View>
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: FADE_HEIGHT,
          }}
        >
          <LinearGradient
            colors={[`${FADE_COLOR}00`, FADE_COLOR]}
            style={{ flex: 1 }}
          />
        </View>
      </View>
    </StModal>
  );
};

export default RebookDaysPickerModal;
