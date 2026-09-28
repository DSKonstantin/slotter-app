import React from "react";
import WheelPicker from "@quidone/react-native-wheel-picker";
import {
  ITEM_HEIGHT,
  PICKER_HEIGHT,
  VISIBLE_ITEMS,
  WheelFrame,
  useWheelHaptics,
} from "./WheelFrame";
import { renderWheelPickerItem } from "./WheelPickerItem";

type ValueWheelProps = {
  data: { value: number; label: string }[];
  value: number;
  width: number;
  onChange: (value: number) => void;
};

export const ValueWheel = ({
  data,
  value,
  width,
  onChange,
}: ValueWheelProps) => {
  const handleValueChanging = useWheelHaptics();

  return (
    <WheelFrame width={width}>
      <WheelPicker
        style={{ height: PICKER_HEIGHT }}
        itemHeight={ITEM_HEIGHT}
        visibleItemCount={VISIBLE_ITEMS}
        renderOverlay={null}
        renderItem={renderWheelPickerItem}
        data={data}
        value={value}
        onValueChanging={handleValueChanging}
        onValueChanged={({ item }) => onChange(item.value)}
      />
    </WheelFrame>
  );
};
