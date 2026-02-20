import React, { useMemo } from "react";
import { Dimensions, View, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Modal, { ModalProps } from "react-native-modal";
import { BlurView } from "expo-blur";

type StModalProps = {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  containerClassName?: string;
  horizontalPadding?: boolean;
  props?: ModalProps;
};

const swipeThreshold = Dimensions.get("window").height * 0.1;

export const StModal = ({
  visible,
  onClose,
  children,
  horizontalPadding = true,
  ...props
}: StModalProps) => {
  const { bottom, left, right } = useSafeAreaInsets();

  const containerStyle = useMemo(
    () => ({
      paddingBottom: bottom + 8,
      ...(horizontalPadding && {
        paddingLeft: 20 + left,
        paddingRight: 20 + right,
      }),
    }),
    [bottom, left, right, horizontalPadding],
  );

  return (
    <Modal
      isVisible={visible}
      swipeDirection={"down"}
      swipeThreshold={swipeThreshold}
      onBackdropPress={onClose}
      onSwipeComplete={onClose}
      statusBarTranslucent
      style={styles.container}
      {...props}
    >
      <View
        className="py-3 relative rounded-t-large bg-white/90 overflow-hidden"
        style={containerStyle}
      >
        <BlurView intensity={50} tint="light" style={StyleSheet.absoluteFill} />
        <View className="items-center mb-3">
          <View className="w-[83px] h-1 rounded-large bg-[#78788029]" />
        </View>

        {children}
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
