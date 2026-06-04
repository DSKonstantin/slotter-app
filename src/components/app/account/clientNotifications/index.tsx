import React, { useState } from "react";
import { ScrollView, View } from "react-native";
import { router } from "expo-router";
import ScreenWithToolbar from "@/src/components/shared/layout/screenWithToolbar";
import {
  Badge,
  Button,
  Card,
  Divider,
  StSvg,
  Typography,
} from "@/src/components/ui";
import DirectDiffModal from "./DirectDiffModal";
import { colors } from "@/src/styles/colors";
import { Routers } from "@/src/constants/routers";

const FILTER_PERIODS = ["Сегодня", "Неделя", "Месяц"] as const;

const STATS = [
  { value: "142", label: "Отправлено", color: "text-primary-blue-500" },
  { value: "138", label: "Доставлено", color: "text-green-700" },
  { value: "4", label: "Ошибки", color: "text-accent-red-500" },
] as const;

const APP_FEATURES = [
  {
    icon: "Refresh_2_light" as const,
    text: "Клиент сам записывается повторно",
  },
  { icon: "Refresh_2_light" as const, text: "Переносит и отменяет запись" },
  {
    icon: "Refresh_2_light" as const,
    text: "Оставляет отзыв прямо в приложении",
  },
  { icon: "Chat_light" as const, text: "Пишет в чат без лишних мессенджеров" },
];

const TELEGRAM_BOTS = ["Telegram Bot", "Макс Bot"] as const;

const DIRECT_CHANNELS = [
  {
    channel: "telegram" as const,
    icon: "SocialTelegram" as const,
    iconColor: "#37B5DB",
    name: "Telegram",
    price: "от 1 000 ₽/мес",
  },
  {
    channel: "max" as const,
    icon: "SocialTelegram" as const,
    iconColor: "#7B61FF",
    name: "Макс",
    price: "от 1 000 ₽/мес",
  },
  {
    channel: "whatsapp" as const,
    icon: "SocialWhatsApp" as const,
    iconColor: "#41C252",
    name: "WhatsApp",
    price: "от 1 000 ₽/мес",
  },
];

const ClientNotifications = () => {
  const [activePeriod, setActivePeriod] = useState(0);
  const [diffModalVisible, setDiffModalVisible] = useState(false);

  return (
    <>
      <ScreenWithToolbar title="Уведомления клиентам">
        {({ topInset, bottomInset }) => (
          <ScrollView
            className="px-screen"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingTop: topInset,
              paddingBottom: bottomInset + 8,
            }}
          >
            <View className="flex-row justify-between items-center mb-2">
              <Typography weight="semibold" className="text-body">
                Статистика
              </Typography>
              <Button
                title="Подробнее"
                size="xs"
                buttonClassName="gap-0"
                textClassName="text-neutral-500 text-[13px]"
                variant="clear"
                onPress={() =>
                  router.push(
                    Routers.app.account.clientNotifications.statistics,
                  )
                }
                rightIcon={
                  <StSvg
                    name="Expand_right"
                    size={16}
                    color={colors.neutral[500]}
                  />
                }
              />
            </View>

            <View className="bg-background-surface p-4 rounded-base gap-5">
              <View className="flex-row flex-wrap gap-2">
                {FILTER_PERIODS.map((period, i) => (
                  <Badge
                    key={period}
                    title={period}
                    variant={i === activePeriod ? "accent" : "ghost"}
                    onPress={() => setActivePeriod(i)}
                  />
                ))}
              </View>

              <View className="flex-row flex-wrap gap-2">
                {STATS.map(({ value, label, color }) => (
                  <View key={label} className="flex-1">
                    <Typography
                      weight="semibold"
                      className={`text-display ${color}`}
                    >
                      {value}
                    </Typography>
                    <Typography
                      weight="regular"
                      className="text-neutral-500 text-caption"
                    >
                      {label}
                    </Typography>
                  </View>
                ))}
              </View>
            </View>

            <Typography className="text-caption text-neutral-500 mt-5 mb-2">
              Бесплатные каналы
            </Typography>

            <View className="bg-background-surface p-4 rounded-base">
              <View className="flex-row gap-2 items-center">
                <View className="w-8 h-8 bg-red-500" />
                <View>
                  <Typography className="text-body">
                    Slotter - трекер услуг и мастеров
                  </Typography>
                  <Typography
                    weight="regular"
                    className="text-caption text-neutral-500"
                  >
                    Приложение для клиентов
                  </Typography>
                </View>
              </View>

              <Divider className="my-4" />

              <View className="mb-2.5">
                {APP_FEATURES.map(({ icon, text }) => (
                  <View key={text} className="flex-row gap-2 items-center">
                    <StSvg name={icon} size={20} color={colors.neutral[400]} />
                    <Typography weight="regular" className="text-caption">
                      {text}
                    </Typography>
                  </View>
                ))}
              </View>

              <Button
                title="Поделиться приложением"
                onPress={() => {}}
                variant="accent"
                rightIcon={
                  <StSvg name="link_alt" size={24} color={colors.neutral[0]} />
                }
              />
            </View>

            <View className="my-2 flex-row gap-2">
              {TELEGRAM_BOTS.map((title) => (
                <Card
                  key={title}
                  title={title}
                  left={
                    <StSvg name="SocialTelegram" size={24} color="#37B5DB" />
                  }
                  className="flex-1"
                  right={
                    <StSvg
                      name="Expand_right_light"
                      size={24}
                      color={colors.neutral[900]}
                    />
                  }
                />
              ))}
            </View>

            <Typography
              weight="regular"
              className="text-caption text-neutral-500"
            >
              Клиент получит уведомление, если подписался на бота или установил
              приложение
            </Typography>

            <Typography className="text-caption text-neutral-500 mt-5 mb-2">
              Прямые уведомления
            </Typography>

            <Card
              title="Чем отличается от бесплатных?"
              left={
                <StSvg
                  name="Info_alt_fill"
                  size={28}
                  color={colors.neutral[500]}
                />
              }
              right={
                <StSvg
                  name="Expand_right_light"
                  size={24}
                  color={colors.neutral[900]}
                />
              }
              onPress={() => setDiffModalVisible(true)}
            />

            <View className="bg-background-surface p-4 rounded-base mt-2">
              {DIRECT_CHANNELS.map(
                ({ channel, icon, iconColor, name, price }, i) => (
                  <React.Fragment key={name}>
                    <Card
                      className="p-0"
                      titleNode={
                        <View className="flex-row items-center gap-1.5">
                          <StSvg name={icon} size={28} color={iconColor} />
                          <Typography className="text-body">{name}</Typography>
                        </View>
                      }
                      subtitle={price}
                      right={
                        <View className="flex-row items-center gap-1">
                          <Typography className="text-primary-blue-500 text-[13px] font-inter-semibold">
                            Подключить
                          </Typography>
                          <StSvg
                            name="Add_round"
                            size={16}
                            color={colors.primary.blue[500]}
                          />
                        </View>
                      }
                      onPress={() =>
                        router.push({
                          pathname:
                            Routers.app.account.clientNotifications.direct,
                          params: { channel },
                        })
                      }
                    />
                    {i < DIRECT_CHANNELS.length - 1 && (
                      <Divider className="my-4" />
                    )}
                  </React.Fragment>
                ),
              )}
            </View>

            <Typography className="text-caption text-neutral-500 mt-5 mb-2">
              Настройки
            </Typography>

            <Card
              title="Виды уведомлений"
              subtitle="Подключено: 4 / 8"
              subtitleProps={{
                style: {
                  color: colors.primary.green[600],
                },
              }}
              onPress={() =>
                router.push(Routers.app.account.clientNotifications.types)
              }
              right={
                <StSvg
                  name="Expand_right_light"
                  size={24}
                  color={colors.neutral[900]}
                />
              }
            />
          </ScrollView>
        )}
      </ScreenWithToolbar>

      <DirectDiffModal
        visible={diffModalVisible}
        onClose={() => setDiffModalVisible(false)}
      />
    </>
  );
};

export default ClientNotifications;
