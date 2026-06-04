import React from "react";
import { ScrollView, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import ScreenWithToolbar from "@/src/components/shared/layout/screenWithToolbar";
import {
  Button,
  Divider,
  FloatingFooter,
  StSvg,
  Typography,
} from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import { MaxLogo } from "@/src/components/shared/svg/MaxLogo";

type Channel = "telegram" | "max" | "whatsapp";

const CHANNEL_CONFIG: Record<
  Channel,
  {
    icon: "SocialTelegram" | "SocialWhatsApp" | "SocialMax";
    iconNode?: React.ReactNode;
    iconColor: string;
    name: string;
    description: string;
    features: string[];
    price: string;
  }
> = {
  telegram: {
    icon: "SocialTelegram",
    iconColor: "#37B5DB",
    name: "Telegram",
    description:
      "Уведомления клиентам от вашего имени — без дополнительных действий с их стороны",
    features: [
      "Сообщения приходят от вашего аккаунта",
      "Клиент видит ваше имя, а не бота",
      "Работает без подписки клиента",
    ],
    price: "1 000 ₽/мес",
  },
  max: {
    icon: "SocialMax",
    iconNode: <MaxLogo size={80} />,
    iconColor: "#7B61FF",
    name: "Макс",
    description:
      "Уведомления клиентам от вашего имени — без дополнительных действий с их стороны",
    features: [
      "Сообщения приходят от вашего аккаунта",
      "Клиент видит ваше имя, а не бота",
      "Работает без подписки клиента",
    ],
    price: "1 000 ₽/мес",
  },
  whatsapp: {
    icon: "SocialWhatsApp",
    iconColor: "#41C252",
    name: "WhatsApp",
    description:
      "Уведомления клиентам от вашего имени — без дополнительных действий с их стороны",
    features: [
      "Сообщения приходят от вашего аккаунта",
      "Клиент видит ваше имя, а не бота",
      "Работает без подписки клиента",
    ],
    price: "1 000 ₽/мес",
  },
};

const DirectNotifications = () => {
  const { channel } = useLocalSearchParams<{ channel: Channel }>();
  const config = CHANNEL_CONFIG[channel ?? "telegram"];

  return (
    <ScreenWithToolbar title="Прямые уведомления">
      {({ topInset, bottomInset }) => (
        <>
          <ScrollView
            style={{ paddingTop: topInset }}
            className="px-screen"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: bottomInset + 56 }}
          >
            <View className="items-center">
              {config.iconNode ?? (
                <StSvg name={config.icon} size={80} color={config.iconColor} />
              )}
              <Typography weight="semibold" className="text-display mt-2">
                {config.name}
              </Typography>
              <Typography
                weight="regular"
                className="text-body text-neutral-500 text-center mt-2.5"
              >
                {config.description}
              </Typography>
            </View>

            <View className="bg-background-surface p-4 rounded-base my-5">
              {config.features.map((feature, i) => (
                <View key={feature} className="items-center">
                  <View className="flex-row gap-1 items-center">
                    <StSvg
                      name="Done_round"
                      size={20}
                      color={colors.primary.green[600]}
                    />
                    <Typography weight="regular" className="text-body flex-1">
                      {feature}
                    </Typography>
                  </View>
                  {i < config.features.length - 1 && (
                    <Divider className="my-4" />
                  )}
                </View>
              ))}
            </View>
          </ScrollView>
          <FloatingFooter offset={bottomInset + 8}>
            <Button
              title={`Подключить за ${config.price}`}
              onPress={() => {}}
              variant="accent"
            />
          </FloatingFooter>
        </>
      )}
    </ScreenWithToolbar>
  );
};

export default DirectNotifications;
