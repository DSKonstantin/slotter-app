import React from "react";
import { View } from "react-native";
import { Image } from "expo-image";
import { Button, Typography } from "@/src/components/ui";
import usePersistentStorage from "@/src/hooks/usePersistentStorage";
import { useOpenPersonalAccount } from "@/src/hooks/useOpenPersonalAccount";
import partnerPortalImage from "@/assets/images/app/partner-portal.webp";

const ILLUSTRATION_WIDTH = 145;
const ILLUSTRATION_ASPECT_RATIO = 1323 / 1189;

const REFERRAL_CARD_HIDDEN_KEY = "finances_referral_card_hidden";

const ReferralEarnCard = () => {
  const [isHidden, setIsHidden] = usePersistentStorage(
    REFERRAL_CARD_HIDDEN_KEY,
    false,
  );
  const openPersonalAccount = useOpenPersonalAccount();

  if (isHidden) return null;

  return (
    <View className="bg-background-surface rounded-base p-4 overflow-hidden">
      <View className="gap-3">
        <View className="gap-1">
          <Typography weight="medium" className="text-body text-neutral-900">
            Заработай{" "}
            <Typography
              weight="semibold"
              className="text-body text-primary-blue-500"
            >
              42 550₽
            </Typography>
          </Typography>
          <Typography className="text-caption text-neutral-500">
            Рекомендуй приложение коллегам
          </Typography>
        </View>

        <View className="flex-row gap-2">
          <Button
            title="Перейти"
            variant="accent"
            size="xs"
            buttonClassName="px-4"
            textClassName="text-[13px]"
            onPress={() => openPersonalAccount("/referral")}
          />
          <Button
            title="Скрыть"
            variant="secondary"
            size="xs"
            textClassName="text-[13px]"
            onPress={() => setIsHidden(true)}
          />
        </View>
      </View>

      <View pointerEvents="none" className="absolute -right-6 -bottom-6">
        <Image
          source={partnerPortalImage}
          style={{
            width: ILLUSTRATION_WIDTH,
            height: ILLUSTRATION_WIDTH / ILLUSTRATION_ASPECT_RATIO,
          }}
          contentFit="contain"
          accessible={false}
        />
      </View>
    </View>
  );
};

export default ReferralEarnCard;
