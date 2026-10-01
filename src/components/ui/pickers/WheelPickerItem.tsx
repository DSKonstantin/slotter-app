import React, { memo } from "react";
import { StyleSheet, View } from "react-native";
import { AppText } from "@/src/components/ui/AppText";
import {
  usePickerItemHeight,
  type PickerItem,
  type RenderItem,
  type RenderItemProps,
} from "@quidone/react-native-wheel-picker";
import { MAX_FONT_SCALE } from "@/src/constants/layout";

const WheelPickerItem = memo(function WheelPickerItem({
  item,
  itemTextStyle,
}: RenderItemProps<PickerItem<unknown>>) {
  const height = usePickerItemHeight();

  return (
    <View style={{ height, justifyContent: "center" }}>
      <AppText
        maxFontSizeMultiplier={MAX_FONT_SCALE}
        numberOfLines={1}
        style={[styles.text, itemTextStyle]}
      >
        {item.label ?? String(item.value)}
      </AppText>
    </View>
  );
});

const styles = StyleSheet.create({
  text: {
    textAlign: "center",
    fontSize: 20,
  },
});

export const renderWheelPickerItem: RenderItem<PickerItem<unknown>> = (
  props,
) => <WheelPickerItem {...props} />;
