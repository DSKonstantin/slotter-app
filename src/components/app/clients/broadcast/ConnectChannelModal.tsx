import React from "react";
import { router } from "expo-router";
import { Image } from "expo-image";

import { Button, StModal, StSvg, Typography } from "@/src/components/ui";
import { Routers } from "@/src/constants/routers";
import { colors } from "@/src/styles/colors";
import connectChannelImage from "@/assets/images/app/connect-messaging-channel.webp";

type Props = {
  visible: boolean;
  onClose: () => void;
  onConnect?: () => void;
};

const ConnectChannelModal = ({ visible, onClose, onConnect }: Props) => (
  <StModal visible={visible} onClose={onClose}>
    <Image
      source={connectChannelImage}
      style={{
        width: "100%",
        aspectRatio: 16 / 9,
        borderRadius: 20,
        marginBottom: 16,
      }}
      contentFit="cover"
      accessible={false}
    />
    <Typography weight="semibold" className="text-xl mb-2">
      Подключите канал рассылки
    </Typography>
    <Typography weight="regular" className="text-body mb-2">
      Чтобы отправлять клиентам уведомления, акции, напоминания и рассылки,
      подключите хотя бы один директ-канал связи
    </Typography>

    <Button
      title="Подключить уведомления"
      variant="accent"
      rightIcon={
        <StSvg name="Arrow_right" size={24} color={colors.neutral[0]} />
      }
      onPress={() => {
        onClose();
        if (onConnect) {
          onConnect();
          return;
        }
        router.push(Routers.app.account.clientNotifications.root);
      }}
    />
  </StModal>
);

export default ConnectChannelModal;
