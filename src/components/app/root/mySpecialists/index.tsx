import React from "react";
import { Pressable, ScrollView, View } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { Typography } from "@/src/components/ui";
import { StSvg } from "@/src/components/ui/StSvg";
import { colors } from "@/src/styles/colors";
import { useAppSelector } from "@/src/store/redux/store";
import { useGetCustomerVisitedUsersQuery } from "@/src/store/redux/services/api/appointmentsApi";
import type { VisitedUser } from "@/src/store/redux/services/api-types";

const AVATAR_SIZE = 92;
const AVATAR_RADIUS = 24;

const SpecialistCard = ({ user }: { user: VisitedUser }) => (
  <Pressable className="w-[92px] items-start active:opacity-70">
    {user.avatar_url ? (
      <Image
        source={{ uri: user.avatar_url }}
        placeholder={
          user.avatar_blurhash ? { blurhash: user.avatar_blurhash } : undefined
        }
        contentFit="cover"
        style={{
          width: AVATAR_SIZE,
          height: AVATAR_SIZE,
          borderRadius: AVATAR_RADIUS,
        }}
      />
    ) : (
      <View
        style={{
          width: AVATAR_SIZE,
          height: AVATAR_SIZE,
          borderRadius: AVATAR_RADIUS,
        }}
        className="bg-neutral-100 items-center justify-center"
      >
        <Typography weight="semibold" className="text-title text-neutral-400">
          {user.first_name[0]?.toUpperCase()}
        </Typography>
      </View>
    )}
    <Typography weight="medium" className="text-body mt-2" numberOfLines={1}>
      {user.first_name}
    </Typography>
    <View className="flex-row items-center justify-between w-full mt-0.5">
      <Typography
        className="text-caption text-neutral-500 flex-1 mr-1"
        numberOfLines={2}
      >
        {user.profession}
      </Typography>
      <StSvg name="Expand_right" size={14} color={colors.neutral[400]} />
    </View>
  </Pressable>
);

const MySpecialists = () => {
  const userId = useAppSelector((s) => s.auth.user?.id);

  const { data } = useGetCustomerVisitedUsersQuery(userId!, {
    skip: !userId,
  });

  const users = data?.users ?? [];

  if (users.length === 0) return null;

  return (
    <View className="mt-4">
      <View className="flex-row items-center justify-between px-4 mb-3">
        <Typography weight="semibold" className="text-title">
          Твои специалисты
        </Typography>
        <Pressable
          className="flex-row items-center gap-1 active:opacity-70"
          onPress={() => router.push("/(app)/mySpecialists" as any)}
        >
          <Typography className="text-caption text-neutral-500">Все</Typography>
          <StSvg name="Expand_right" size={14} color={colors.neutral[500]} />
        </Pressable>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 16 }}
      >
        {users.map((user) => (
          <SpecialistCard key={user.id} user={user} />
        ))}
      </ScrollView>
    </View>
  );
};

export default MySpecialists;
