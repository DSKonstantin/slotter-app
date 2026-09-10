import React, { memo } from "react";
import { Pressable, View } from "react-native";
import { router } from "expo-router";

import { Badge, Divider, StSvg, Typography } from "@/src/components/ui";
import { MaxLogo } from "@/src/components/shared/svg/MaxLogo";
import { SlotterLogo } from "@/src/components/shared/svg/SlotterLogo";
import { colors } from "@/src/styles/colors";
import { Routers } from "@/src/constants/routers";
import {
  CHANNEL_LABELS,
  type BroadcastChannel,
  type BroadcastItem,
} from "./broadcastMock";

const NOTE_COLORS = {
  green: "text-primary-green-600",
  blue: "text-primary-blue-500",
} as const;

const ChannelIcon = ({ channel }: { channel: BroadcastChannel }) => {
  if (channel === "telegram") {
    return <StSvg name="SocialTelegram" size={24} color="#37B5DB" />;
  }
  if (channel === "max") {
    return <MaxLogo size={24} />;
  }
  return <SlotterLogo size={24} />;
};

type Props = {
  item: BroadcastItem;
};

const BroadcastCard = ({ item }: Props) => (
  <Pressable
    onPress={() => router.push(Routers.app.clients.broadcastEdit(item.id))}
    className="bg-background-surface rounded-base p-4 active:opacity-70"
  >
    <View className="flex-row items-center gap-2">
      <ChannelIcon channel={item.channel} />
      <Typography weight="medium" className="text-body flex-1">
        {CHANNEL_LABELS[item.channel]}
      </Typography>
      {item.headerBadge ? (
        <Badge
          size="sm"
          title={item.headerBadge.title}
          variant={item.headerBadge.variant}
          icon={
            item.headerBadge.variant === "completed" ? (
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
      ) : item.headerDate ? (
        <Typography className="text-caption text-neutral-400">
          {item.headerDate}
        </Typography>
      ) : null}
    </View>

    <Typography weight="semibold" className="text-body mt-3">
      {item.title}
    </Typography>
    <Typography
      weight="regular"
      className="text-caption text-neutral-500 mt-1"
      numberOfLines={1}
    >
      {item.message}
    </Typography>

    <Divider className="my-3" />

    <View className="flex-row items-center gap-2">
      <View className="flex-row items-center min-h-[24px]">
        {item.stat.audience && (
          <StSvg name="Group_light" size={24} color={colors.neutral[400]} />
        )}
        <Typography className="text-caption text-neutral-500">
          {item.stat.label}: {item.stat.value}
        </Typography>
      </View>

      {item.stat.note && (
        <Typography
          weight="medium"
          className={`text-caption ${
            item.stat.noteColor
              ? NOTE_COLORS[item.stat.noteColor]
              : "text-neutral-900"
          }`}
        >
          {item.stat.note}
        </Typography>
      )}
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

export default memo(BroadcastCard);
