import React from "react";
import { Modal, Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type BottomModalProps = {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

export const BottomModal = ({
  visible,
  onClose,
  children,
}: BottomModalProps) => {
  const { bottom } = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable className="flex-1 justify-end" onPress={onClose}>
        <View
          style={{ paddingBottom: bottom }}
          className="bg-white rounded-large px-5 pt-3"
        >
          <Pressable onPress={onClose} className="items-center mb-3">
            <View className="w-[83px] h-1 rounded-[36px] bg-[#78788029]" />
          </Pressable>

          {children}
        </View>
      </Pressable>
    </Modal>
  );
};
