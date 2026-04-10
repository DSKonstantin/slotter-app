import React from "react";
import { View, Text } from "react-native";
import { Avatar, Badge } from "@/src/components/ui";

type Props = {
  name: string;
  phone?: string;
  visitsCount: number;
  totalSpent: string;
  tag?: { name: string };
};

const ClientInfoCard = ({
  name,
  phone,
  visitsCount,
  totalSpent,
  tag,
}: Props) => {
  return (
    <View className="flex-row rounded-base bg-background-surface p-4">
      <View className="mr-3">
        <Avatar name={name} size="md" />
      </View>

      <View className="flex-1">
        <View className="flex-row items-center justify-between gap-1">
          <Text className="font-inter-medium text-body text-neutral-900">
            {name}
          </Text>
          {tag && <Badge title={tag.name} variant="info" size="sm" />}
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
