import React from "react";
import { View } from "react-native";
import { Divider, StModal, Typography } from "@/src/components/ui";

type AuthMethodSheetProps = {
  visible: boolean;
  onClose: () => void;
  onHidden?: () => void;
  dismissible?: boolean;
  children: React.ReactNode;
};

const Separator = () => (
  <View className="flex-row items-center gap-3 my-4">
    <Divider className="flex-1" />
    <Typography className="text-caption text-neutral-500">Или</Typography>
    <Divider className="flex-1" />
  </View>
);

export function AuthMethodSheet({
  visible,
  onClose,
  onHidden,
  dismissible = true,
  children,
}: AuthMethodSheetProps) {
  const methods = React.Children.toArray(children);

  return (
    <StModal
      visible={visible}
      onClose={onClose}
      headerCloseButton
      dismissible={dismissible}
      onModalHide={onHidden}
    >
      {methods.map((method, index) => (
        <React.Fragment key={index}>
          {index > 0 && <Separator />}
          {method}
        </React.Fragment>
      ))}
    </StModal>
  );
}
