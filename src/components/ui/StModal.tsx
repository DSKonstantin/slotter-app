import React from "react";
import { Dimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Modal, { ModalProps } from "react-native-modal";

type StModalProps = {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
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
        className="rounded-t-large bg-white px-5 pt-3"
        style={{ paddingBottom: bottom + 8 }}
      >
        <View className="items-center mb-3">
          <View className="w-[83px] h-1 rounded-large bg-[#78788029]" />
        </View>

        {children}
      </View>
    </Modal>
  );
};
