import React from "react";
import { View, Text } from "react-native";
import { Avatar, Badge } from "@/src/components/ui";

type Props = {
  name: string;
  phone?: string;
  avatarUrl?: string;
  avatarBlurhash?: string | null;
  visitsCount: number;
  totalSpent: string;
  tag?: { name: string; color: string };
};

const ClientInfoCard = ({
  name,
  phone,
  avatarUrl,
  avatarBlurhash,
  visitsCount,
  totalSpent,
  tag,
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
          <Text className="font-inter-medium text-body text-neutral-900">
            {name}
          </Text>
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
          <Text className="font-inter-medium text-caption text-neutral-500">
            {phone}
          </Text>
        )}

        <Text className="font-inter-regular text-caption text-neutral-400 mt-1">
          {visitsCount} визитов | {totalSpent} потрачено
        </Text>
      </View>
    </View>
  );
};

export default ClientInfoCard;
