import React from "react";
import { View } from "react-native";
import * as WebBrowser from "expo-web-browser";
import { Button, StModal, Typography } from "@/src/components/ui";
import { SUPPORT_TELEGRAM_URL } from "@/src/constants/support";

type AccountDeactivatedModalProps = {
  visible: boolean;
  onClose: () => void;
};

export function AccountDeactivatedModal({
  visible,
  onClose,
}: AccountDeactivatedModalProps) {
  return (
    <StModal visible={visible} onClose={onClose}>
      <Typography weight="semibold" className="text-display text-center mb-3">
        Аккаунт деактивирован
      </Typography>
      <Typography className="text-body text-neutral-500 text-center mb-6">
        Ваш аккаунт был деактивирован. Обратитесь в поддержку, чтобы
        восстановить доступ.x
      </Typography>
      <View className="gap-3">
        <Button
          title="Написать в поддержку"
          onPress={() => WebBrowser.openBrowserAsync(SUPPORT_TELEGRAM_URL)}
        />
        <Button title="Закрыть" variant="secondary" onPress={onClose} />
      </View>
    </StModal>
  );
}
