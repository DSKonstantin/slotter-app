import React, { memo } from "react";
import { Pressable, View } from "react-native";
import { router } from "expo-router";

import { Badge, Divider, StSvg, Typography } from "@/src/components/ui";
import { MaxLogo } from "@/src/components/shared/svg/MaxLogo";
import { colors } from "@/src/styles/colors";
import { Routers } from "@/src/constants/routers";
import type {
  DirectChannelKind,
  MarketingBroadcast,
} from "@/src/store/redux/services/api-types";
import {
  BADGE_ICON_COLOR,
  getBroadcastBadge,
  getBroadcastMetric,
} from "./broadcastPresentation";

const CHANNEL_LABELS: Record<DirectChannelKind, string> = {
  telegram_direct: "Telegram Direct",
  max_direct: "Макс Direct",
};

const ChannelIcon = ({ channel }: { channel: DirectChannelKind }) => {
  if (channel === "telegram_direct") {
    return <StSvg name="SocialTelegram" size={24} color="#37B5DB" />;
  }
  return <MaxLogo size={24} />;
};

type Props = {
  item: MarketingBroadcast;
};

const BroadcastCard = ({ item }: Props) => {
  const badge = getBroadcastBadge(item);
  const metric = getBroadcastMetric(item);

  return (
    <Pressable
      onPress={() =>
        router.push(Routers.app.broadcast.detail(item.id))
      }
      className="bg-background-surface rounded-base p-4 active:opacity-70"
    >
      <View className="flex-row items-center gap-2">
        <ChannelIcon channel={item.channel_kind} />
        <Typography weight="medium" className="text-body flex-1">
          {CHANNEL_LABELS[item.channel_kind]}
        </Typography>
        {badge && (
          <Badge
            size="sm"
            title={badge.title}
            variant={badge.variant}
            icon={
              <StSvg
                name={badge.icon}
                size={16}
                color={BADGE_ICON_COLOR[badge.variant]}
              />
            }
          />
        )}
      </View>

      <Typography weight="semibold" className="text-body mt-3">
        {item.name}
      </Typography>
      <Typography
        weight="regular"
        className="text-caption text-neutral-500 mt-1"
        numberOfLines={1}
      >
        {item.body}
      </Typography>

      <Divider className="my-3" />

      <View className="flex-row items-center gap-2">
        <View className="flex-row items-center gap-1 min-h-[24px]">
          {metric.icon && (
            <StSvg name="Group_light" size={24} color={colors.neutral[400]} />
          )}
          <Typography className="text-caption text-neutral-500">
            {metric.label}{" "}
            <Typography
              weight="medium"
              className="text-caption text-neutral-900"
            >
              {metric.value}
            </Typography>
            {metric.suffix && (
              <>
                {"  "}
                <Typography
                  weight="medium"
                  className={`text-caption ${
                    metric.suffix.color === "green"
                      ? "text-primary-green-700"
                      : "text-primary-blue-500"
                  }`}
                >
                  {metric.suffix.text}
                </Typography>
              </>
            )}
          </Typography>
        </View>

        <View className="flex-1 items-end">
          <StSvg
            name="Expand_right_light"
            size={20}
            color={colors.neutral[300]}
          />
        </View>
      </View>
    </Pressable>
  );
};

export default memo(BroadcastCard);
