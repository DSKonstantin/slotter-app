import React, { useCallback, useState } from "react";
import { Pressable, View } from "react-native";
import { Avatar, IconButton, StSvg, Typography } from "@/src/components/ui";
import { useAppSelector } from "@/src/store/redux/store";
import { colors } from "@/src/styles/colors";
import CreateActionModal from "./CreateActionModal";
import { router } from "expo-router";
import { Routers } from "@/src/constants/routers";
import ProfileLinkModal from "@/src/components/app/root/homeHeader/ProfileLinkModal";

const HomeHeader = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [profileActionsVisible, setProfileActionsVisible] = useState(false);
  const user = useAppSelector((s) => s.auth.user);
  const fullName = [user?.first_name, user?.last_name]
    .filter(Boolean)
    .join(" ");
  const profileLink = user?.nickname
    ? `${process.env.EXPO_PUBLIC_BOOKING_DISPLAY_URL}/${user.nickname}`
    : null;
  const profileUrl = user?.nickname
    ? `${process.env.EXPO_PUBLIC_BOOKING_BASE_URL}/${user.nickname}`
    : null;

  const handleOpenProfile = useCallback(() => {
    router.push(Routers.app.account.root);
  }, []);

  return (
    <View className="flex-row items-center justify-between px-screen py-2.5">
      <View className="flex-row items-center gap-3 mr-3">
        <Pressable onPress={handleOpenProfile} className="active:opacity-70">
          <Avatar
            uri={user?.avatar_url ?? undefined}
            name={fullName}
            size="md"
          />
        </Pressable>

        <View className="">
          <Pressable onPress={handleOpenProfile} className="active:opacity-70">
            <Typography
              weight="semibold"
              className="text-body"
              numberOfLines={1}
            >
              {fullName}
            </Typography>
          </Pressable>
          <Pressable
            onPress={() => setProfileActionsVisible(true)}
            className="flex-row items-center gap-1 active:opacity-70"
          >
            <Typography className="text-caption text-neutral-500">
              {profileLink ?? "-"}
            </Typography>
            {profileLink && (
              <View style={{ transform: [{ rotate: "90deg" }] }}>
                <StSvg name="Out_light" size={18} color={colors.neutral[500]} />
              </View>
            )}
          </Pressable>
        </View>
      </View>

      <IconButton
        size="sm"
        onPress={() => setModalVisible(true)}
        icon={<StSvg name="Add_round" size={24} color={colors.neutral[900]} />}
      />

      <CreateActionModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />

      <ProfileLinkModal
        visible={profileActionsVisible}
        profileUrl={profileUrl}
        profileLink={profileLink}
        onClose={() => setProfileActionsVisible(false)}
      />
    </View>
  );
};

export default HomeHeader;
