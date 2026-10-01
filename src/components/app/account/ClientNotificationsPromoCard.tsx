import React from "react";
import { Pressable, View } from "react-native";
import { router } from "expo-router";
import { Badge, Divider, StSvg, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import { Routers } from "@/src/constants/routers";
import { PaperPlaneIcon } from "@/src/components/shared/svg/PaperPlaneIcon";

const FEATURES = [
  { icon: "Bell_light", label: "Подтверждение сразу после записи" },
  { icon: "Refresh_2_light", label: "Уведомление при переносе" },
  { icon: "close_ring_light", label: "Клиент узнает, если запись отменили" },
  { icon: "Alarmclock_light", label: "Напоминания до визита" },
] as const;

const ClientNotificationsPromoCard = () => (
  <Pressable
    className="bg-background-surface rounded-base p-4 gap-3 active:opacity-70 overflow-hidden"
    onPress={() => router.push(Routers.app.account.clientNotifications.root)}
  >
    <View className="absolute -bottom-4 right-0" pointerEvents="none">
      <PaperPlaneIcon size={120} />
    </View>

    <View className="flex-row items-start gap-2">
      <StSvg name="Message_fill" size={24} color={colors.neutral[900]} />
      <View className="flex-1 flex-row flex-wrap items-center justify-between gap-x-2 gap-y-1">
        <Typography
          weight="regular"
          className="text-body grow shrink basis-[130px] min-w-[130px]"
        >
          Уведомления клиентам
        </Typography>
        <Badge title="-70% неявок" variant="info" size="sm" />
      </View>
      <View className="h-6 justify-center">
        <StSvg name="Expand_right" size={20} color={colors.neutral[500]} />
      </View>
    </View>

    <Divider />

    <View className="gap-2">
      {FEATURES.map(({ icon, label }) => (
        <View key={icon} className="flex-row items-center gap-2">
          <StSvg name={icon} size={18} color={colors.neutral[900]} />
          <Typography
            weight="regular"
            className="text-caption text-neutral-900 flex-1"
          >
            {label}
          </Typography>
        </View>
      ))}
    </View>
  </Pressable>
);

export default ClientNotificationsPromoCard;
