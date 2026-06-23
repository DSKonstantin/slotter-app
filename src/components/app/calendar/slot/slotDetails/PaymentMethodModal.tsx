import React from "react";
import { View } from "react-native";
import { Card, StModal, Typography } from "@/src/components/ui";
import { PAYMENT_OPTIONS } from "@/src/constants/payment";
import type { PaymentMethod } from "@/src/store/redux/services/api-types";

interface Props {
  visible: boolean;
  currentMethod: PaymentMethod;
  onClose: () => void;
  onModalHide: () => void;
  onSelect: (method: PaymentMethod) => void;
  onComingSoon: () => void;
}

const PaymentMethodModal: React.FC<Props> = ({
  visible,
  currentMethod,
  onClose,
  onModalHide,
  onSelect,
  onComingSoon,
}) => (
  <StModal visible={visible} onClose={onClose} onModalHide={onModalHide}>
    <Typography weight="semibold" className="text-display text-center mb-4">
      Способ оплаты
    </Typography>
    <View className="gap-2">
      {PAYMENT_OPTIONS.map(({ key, label, comingSoon }) => (
        <Card
          key={key}
          title={label}
          active={currentMethod === key}
          className={comingSoon ? "opacity-40" : ""}
          onPress={() => {
            if (comingSoon) {
              onComingSoon();
              return;
            }
            if (key !== currentMethod) {
              onSelect(key);
            } else {
              onClose();
            }
          }}
        />
      ))}
    </View>
  </StModal>
);

export default PaymentMethodModal;
