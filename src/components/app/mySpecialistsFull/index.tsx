import React from "react";
import { FlatList, Pressable, View } from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ScreenWithToolbar from "@/src/components/shared/layout/screenWithToolbar";
import { Typography } from "@/src/components/ui";
import { StSvg } from "@/src/components/ui/StSvg";
import { colors } from "@/src/styles/colors";
import { useAppSelector } from "@/src/store/redux/store";
import { useGetCustomerVisitedUsersQuery } from "@/src/store/redux/services/api/appointmentsApi";
import type { VisitedUser } from "@/src/store/redux/services/api-types";
import { TOOLBAR_HEIGHT } from "@/src/constants/tabs";

const AVATAR_SIZE = 48;
const AVATAR_RADIUS = 99;

const SpecialistRow = ({ user }: { user: VisitedUser }) => (
  <Pressable className="flex-row items-center px-4 py-3 bg-background-surface rounded-base mb-2 mx-4 active:opacity-70">
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
        <Typography weight="semibold" className="text-body text-neutral-400">
          {user.first_name[0]?.toUpperCase()}
        </Typography>
      </View>
    )}
    <View className="flex-1 ml-3">
      <Typography weight="semibold" className="text-body">
        {user.first_name} {user.last_name}
      </Typography>
      <Typography className="text-caption text-neutral-500 mt-0.5">
        {user.profession}
      </Typography>
    </View>
    <StSvg name="Expand_right" size={20} color={colors.neutral[400]} />
  </Pressable>
);

const MySpecialistsFull = () => {
  const userId = useAppSelector((s) => s.auth.user?.id);
  const { top } = useSafeAreaInsets();

  const { data } = useGetCustomerVisitedUsersQuery(userId!, { skip: !userId });
  const users = data?.users ?? [];

  return (
    <ScreenWithToolbar title="Твои специалисты">
      {() => (
        <FlatList
          data={users}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => <SpecialistRow user={item} />}
          contentContainerStyle={{
            paddingTop: TOOLBAR_HEIGHT + top + 12,
            paddingBottom: 24,
          }}
        />
      )}
    </ScreenWithToolbar>
  );
};

export default MySpecialistsFull;
