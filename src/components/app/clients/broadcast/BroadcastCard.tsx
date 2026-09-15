import React, { memo } from "react";
import { ActivityIndicator, Pressable, View } from "react-native";
import { router } from "expo-router";

import { Badge, Divider, StSvg, Typography } from "@/src/components/ui";
import { MaxLogo } from "@/src/components/shared/svg/MaxLogo";
import { colors } from "@/src/styles/colors";
import { Routers } from "@/src/constants/routers";
import type {
  DirectChannelKind,
  MarketingBroadcast,
} from "@/src/store/redux/services/api-types";
import { getBroadcastBadge, getBroadcastMetric } from "./broadcastPresentation";

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

  return (
    <Pressable
      onPress={() => router.push(Routers.app.clients.broadcastDetail(item.id))}
      className="bg-background-surface rounded-base p-4 active:opacity-70"
    >
      <View className="flex-row items-center gap-2">
        <ChannelIcon channel={item.channel_kind} />
        <Typography weight="medium" className="text-body flex-1">
          {CHANNEL_LABELS[item.channel_kind]}
        </Typography>
        {item.status === "preparing" ? (
          <ActivityIndicator size="small" color={colors.neutral[400]} />
        ) : (
          badge && (
            <Badge
              size="sm"
              title={badge.title}
              variant={badge.variant}
              icon={
                badge.variant === "completed" ? (
                  <StSvg
                    name="Done_round"
                    size={16}
                    color={colors.primary.green[700]}
                  />
                ) : (
                  <StSvg
                    name="Time_fill"
                    size={16}
                    color={colors.accent.orange[500]}
                  />
                )
              }
            />
          )
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
        <View className="flex-row items-center min-h-[24px]">
          <StSvg name="Group_light" size={24} color={colors.neutral[400]} />
          <Typography className="text-caption text-neutral-500">
            {getBroadcastMetric(item)}
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
