import React from "react";
import { Linking, ScrollView, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { skipToken } from "@reduxjs/toolkit/query";

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
import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";
import { useAppSelector } from "@/src/store/redux/store";
import {
  useGetSubscriptionDirectPlansQuery,
  useGetSubscriptionDirectChannelsQuery,
} from "@/src/store/redux/services/api/subscriptionDirectApi";
import type { DirectChannelKind } from "@/src/store/redux/services/api-types";
import { asArray } from "@/src/utils/asArray";
import { isDirectChannelActive } from "@/src/utils/directChannel";
import { formatRublesFromCents } from "@/src/utils/price/formatPrice";

type Channel = "telegram" | "max";

const KIND_MAP: Record<Channel, DirectChannelKind> = {
  telegram: "telegram_direct",
  max: "max_direct",
};

const INACTIVE_DIRECT_CHANNEL_STATUSES = new Set(["cancelled", "expired"]);

const CHANNEL_CONFIG: Record<
  Channel,
  {
    icon: "SocialTelegram" | "SocialMax";
    iconNode?: React.ReactNode;
    iconColor: string;
    name: string;
    description: string;
    features: string[];
    howToSteps: string[];
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
    howToSteps: [
      "Оплатите подписку",
      "Введите номер аккаунта Telegram",
      "Введите код из Telegram",
      "Готово — сообщения уходят от вас",
    ],
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
    howToSteps: [
      "Оплатите подписку",
      "Отсканируйте QR-код в приложении Макс",
      "Готово — сообщения уходят от вас",
    ],
  },
};

const DirectNotifications = () => {
  const { channel } = useLocalSearchParams<{ channel: Channel }>();
  const config = CHANNEL_CONFIG[channel ?? "telegram"];
  const kind = KIND_MAP[channel ?? "telegram"];

  const auth = useRequiredAuth();
  const token = useAppSelector((state) => state.auth.token);

  const { data: plans } = useGetSubscriptionDirectPlansQuery();
  const plan = asArray(plans).find((p) => p.kind === kind && p.is_active);

  const { data: channelsData } = useGetSubscriptionDirectChannelsQuery(
    auth ? { userId: auth.userId } : skipToken,
  );

  const existingChannel = asArray(
    channelsData?.subscription_direct_channels,
  ).find(
    (c) => c.kind === kind && !INACTIVE_DIRECT_CHANNEL_STATUSES.has(c.status),
  );

  const isActive = !!existingChannel && isDirectChannelActive(existingChannel);

  const handleCheckout = async () => {
    await Linking.openURL(
      `${process.env.EXPO_PUBLIC_BOOKING_BASE_URL}/personal-account/${auth?.userId}?token=${token}`,
    );
  };

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

            <Typography
              weight="semibold"
              className="text-body mb-3 text-neutral-500"
            >
              Как подключить
            </Typography>

            <View className="rounded-base gap-4 mb-5">
              {config.howToSteps.map((step, i) => (
                <View key={step} className="flex-row gap-3 items-center">
                  <View className="w-[28px] h-[28px] rounded-full bg-primary-blue-500 items-center justify-center">
                    <Typography
                      weight="regular"
                      className="text-body text-neutral-0"
                    >
                      {i + 1}
                    </Typography>
                  </View>
                  <Typography weight="regular" className="text-body">
                    {step}
                  </Typography>
                </View>
              ))}
            </View>
          </ScrollView>
          <FloatingFooter offset={bottomInset + 8}>
            {isActive ? (
              <Button
                title="Канал подключён"
                onPress={() => {}}
                disabled
                variant="accent"
                leftIcon={
                  <StSvg
                    name="Check_round_fill"
                    size={20}
                    color={colors.neutral[0]}
                  />
                }
              />
            ) : (
              <Button
                title={
                  plan
                    ? `Подключить за ${formatRublesFromCents(plan.price_cents)}/мес`
                    : "Подключить"
                }
                onPress={handleCheckout}
                disabled={!plan}
                variant="accent"
              />
            )}
          </FloatingFooter>
        </>
      )}
    </ScreenWithToolbar>
  );
};

export default DirectNotifications;
