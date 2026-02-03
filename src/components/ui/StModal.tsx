import React from "react";
import { Dimensions, View, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Modal, { ModalProps } from "react-native-modal";
import { BlurView } from "expo-blur";

type StModalProps = {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  containerClassName?: string;
  props?: ModalProps;
};

const swipeThreshold = Dimensions.get("window").height * 0.1;

export const StModal = ({
  visible,
  onClose,
  children,
  ...props
}: StModalProps) => {
  const { bottom } = useSafeAreaInsets();

  return (
    <Modal
      isVisible={visible}
      swipeDirection={"down"}
      swipeThreshold={swipeThreshold}
      onBackdropPress={onClose}
      onSwipeComplete={onClose}
      statusBarTranslucent
      style={{
        margin: 0,
        justifyContent: "flex-end",
      }}
      {...props}
    >
      <View
        className={`relative rounded-t-large px-5 pt-3 bg-white/90 overflow-hidden`}
        style={{ paddingBottom: bottom + 8 }}
      >
        <BlurView
          intensity={50}
          tint="light"
          style={[StyleSheet.absoluteFillObject]}
        />
        <View className="items-center mb-3">
          <View className="w-[83px] h-1 rounded-large bg-[#78788029]" />
        </View>

        {children}
      </View>
    </Modal>
  );
};
