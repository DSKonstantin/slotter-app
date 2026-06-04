import React from "react";
import { Linking, View } from "react-native";
import { SUPPORT_TELEGRAM_URL } from "@/src/constants/support";
import {
  Button,
  IconButton,
  StModal,
  StSvg,
  Typography,
} from "@/src/components/ui";

type Props = {
  visible: boolean;
  onClose: () => void;
};

const SupportModal = ({ visible, onClose }: Props) => {
  const handleTelegramPress = async () => {
    await Linking.openURL(SUPPORT_TELEGRAM_URL);
  };

  return (
    <StModal visible={visible} onClose={onClose}>
      <Typography weight="semibold" className="text-body text-center mb-2">
        Нужна помощь?
      </Typography>

      <Typography
        weight="regular"
        className="text-neutral-500 text-body text-center"
      >
        Мы на связи, выбери где удобнее:
      </Typography>

      <View className="flex-row justify-center items-center my-6 gap-10">
        <IconButton
          buttonClassName="border border-neutral-100"
          onPress={handleTelegramPress}
          icon={<StSvg name="SocialTelegram" size={24} color="#37B5DB" />}
        />
      </View>

      <Button title="Закрыть" onPress={onClose} />
    </StModal>
  );
};

export default SupportModal;
