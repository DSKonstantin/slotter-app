import React, { useMemo } from "react";
import { View, StyleSheet, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Modal, { ModalProps } from "react-native-modal";
import { BlurView } from "expo-blur";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { BottomSheetHandle } from "./BottomSheetHandle";

type StModalProps = {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  containerClassName?: string;
  horizontalPadding?: boolean;
  keyboardAware?: boolean;
  fullHeight?: boolean;
  props?: ModalProps;
};

export const StModal = ({
  visible,
  onClose,
  children,
  horizontalPadding = true,
  keyboardAware = false,
  fullHeight = false,
  ...props
}: StModalProps) => {
  const { height } = useWindowDimensions();
  const { top, bottom, left, right } = useSafeAreaInsets();
  const swipeThreshold = height * 0.1;

  const containerStyle = useMemo(
    () => ({
      ...(fullHeight ? { height: height - top } : { maxHeight: height - top }),
      paddingBottom: bottom + 8,
      ...(horizontalPadding && {
        paddingLeft: 20 + left,
        paddingRight: 20 + right,
      }),
    }),
    [bottom, fullHeight, height, horizontalPadding, left, right, top],
  );

  return (
    <Modal
      isVisible={visible}
      swipeDirection={"down"}
      swipeThreshold={swipeThreshold}
      propagateSwipe
      onBackdropPress={onClose}
      onSwipeComplete={onClose}
      statusBarTranslucent
      style={[styles.container, { paddingTop: top }]}
      {...props}
    >
      <View
        className="py-3 relative rounded-t-large bg-white/90 overflow-hidden"
        style={containerStyle}
      >
        <BlurView intensity={50} tint="light" style={StyleSheet.absoluteFill} />
        <BottomSheetHandle />

        {keyboardAware ? (
          <KeyboardAwareScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {children}
          </KeyboardAwareScrollView>
        ) : (
          children
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 0,
    justifyContent: "flex-end",
  },
});
