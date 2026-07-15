import React from "react";
import { Linking, View } from "react-native";
import { Image } from "expo-image";
import { StModal, Button, Typography } from "@/src/components/ui";
import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";
import { useAppSelector } from "@/src/store/redux/store";
import limitFreeImage from "@/assets/images/app/limit-free.png";

type Props = {
  visible: boolean;
  onClose: () => void;
};

const SlotLimitModal = ({ visible, onClose }: Props) => {
  const auth = useRequiredAuth();
  const token = useAppSelector((state) => state.auth.token);
  const ispe = useAppSelector((state) => state.appVersion.ispe);

  const handleUpgrade = async () => {
    await Linking.openURL(
      `${process.env.EXPO_PUBLIC_BOOKING_BASE_URL}/personal-account/${auth?.userId}?token=${token}`,
    );
    onClose();
  };

  return (
    <StModal visible={visible && ispe} onClose={onClose}>
      <Image
        source={limitFreeImage}
        style={{ width: "100%", height: 275, borderRadius: 20 }}
        contentFit="cover"
        accessible={false}
      />
      <View className="items-center gap-3 py-2 mb-4 mt-4">
        <Typography
          weight="semibold"
          className="text-display text-neutral-900 text-center"
        >
          У вас закончился лимит бесплатных слотов
        </Typography>
        <Typography className="text-body text-neutral-500 text-center">
          Переходите на следующий уровень, вы уже готовы. Это займёт 40 секунд.
        </Typography>
      </View>

      <View className="gap-2">
        <Button
          title="Перейти на PRO"
          variant="accent"
          onPress={handleUpgrade}
        />
        <Button title="Не хочу переходить" variant="clear" onPress={onClose} />
      </View>
    </StModal>
  );
};

export default SlotLimitModal;
