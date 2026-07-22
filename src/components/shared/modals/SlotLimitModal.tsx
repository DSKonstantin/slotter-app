import React from "react";
import { View } from "react-native";
import { Image } from "expo-image";
import { StModal, Button, Typography } from "@/src/components/ui";
import { useOpenPersonalAccount } from "@/src/hooks/useOpenPersonalAccount";
import { useRunOnNextForeground } from "@/src/hooks/useRunOnNextForeground";
import { useLazyGetSubscriptionMembershipQuery } from "@/src/store/redux/services/api/subscriptionApi";
import { useAppSelector } from "@/src/store/redux/store";
import limitFreeImage from "@/assets/images/app/limit-free.webp";

type Props = {
  visible: boolean;
  onClose: () => void;
};

const SlotLimitModal = ({ visible, onClose }: Props) => {
  const openPersonalAccount = useOpenPersonalAccount();
  const ispe = useAppSelector((state) => state.appVersion.ispe);
  const userId = useAppSelector((state) => state.auth.user?.id);
  const [getSubscriptionMembership] = useLazyGetSubscriptionMembershipQuery();
  const runOnNextForeground = useRunOnNextForeground();

  const handleUpgrade = async () => {
    // вернулся из веб-оплаты — подтянуть pro_access/membership
    if (userId != null) {
      runOnNextForeground(() => getSubscriptionMembership({ userId }));
    }
    await openPersonalAccount("/upgrade");
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
