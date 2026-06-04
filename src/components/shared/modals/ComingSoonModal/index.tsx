import React from "react";
import { Linking, View } from "react-native";
import {
  Button,
  IconButton,
  StModal,
  StSvg,
  Typography,
} from "@/src/components/ui";
import { SUPPORT_TELEGRAM_URL } from "@/src/constants/support";

interface Props {
  visible: boolean;
  onClose: () => void;
}

const ComingSoonModal: React.FC<Props> = ({ visible, onClose }) => (
  <StModal visible={visible} onClose={onClose}>
    <Typography weight="semibold" className="text-display text-center mb-5">
      Данная функция находится в разработке
    </Typography>
    <Typography className="text-body text-center">
      Следите за обновлениями Slotter в:
    </Typography>

    <View className="flex-row justify-center items-center my-6 gap-10">
      <IconButton
        buttonClassName="border border-neutral-100"
        onPress={() => Linking.openURL(SUPPORT_TELEGRAM_URL)}
        icon={<StSvg name="SocialTelegram" size={24} color="#37B5DB" />}
      />
    </View>

    <Button title="Закрыть" onPress={onClose} />
  </StModal>
);

export default ComingSoonModal;
