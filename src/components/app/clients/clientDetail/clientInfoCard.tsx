import React from "react";
import { View } from "react-native";
import { Avatar, Badge, Typography } from "@/src/components/ui";
import BlockedIcon from "@/src/components/app/clients/shared/blockedIcon";
import { pluralize } from "@/src/utils/text/pluralize";

type Props = {
  name: string;
  phone?: string;
  avatarUrl?: string;
  avatarBlurhash?: string | null;
  visitsCount: number;
  totalSpent: string;
  tag?: { name: string; color: string };
  blocked?: boolean;
};

const ClientInfoCard = ({
  name,
  phone,
  avatarUrl,
  avatarBlurhash,
  visitsCount,
  totalSpent,
  tag,
  blocked,
}: Props) => {
  return (
    <View className="flex-row rounded-base bg-background-surface p-4">
      <View className="mr-3">
        <Avatar
          name={name}
          size="md"
          uri={avatarUrl}
          blurhash={avatarBlurhash}
        />
      </View>

      <View className="flex-1">
        <View className="flex-row items-center justify-between gap-1 min-h-[26px]">
          <View className="flex-1 flex-row items-center gap-1">
            <Typography className="shrink text-body text-neutral-900">
              {name}
            </Typography>
            {blocked && <BlockedIcon />}
          </View>
          {tag && (
            <Badge
              title={tag.name}
              size="sm"
              style={{ backgroundColor: tag.color }}
              textStyle={{ color: "#fff" }}
            />
          )}
        </View>

        {phone && (
          <Typography className="text-caption text-neutral-500">
            {phone}
          </Typography>
        )}

        <Typography
          weight="regular"
          className="text-caption text-neutral-400 mt-1"
        >
          {visitsCount} {pluralize(visitsCount, ["визит", "визита", "визитов"])}{" "}
          | {totalSpent} потрачено
        </Typography>
      </View>
    </View>
  );
};

export default ClientInfoCard;
