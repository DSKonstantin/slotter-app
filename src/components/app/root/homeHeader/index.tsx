import React, { useCallback, useState } from "react";
import { Pressable, View } from "react-native";
import { skipToken } from "@reduxjs/toolkit/query";
import * as WebBrowser from "expo-web-browser";
import { Avatar, IconButton, StSvg, Typography } from "@/src/components/ui";
import { useAppSelector } from "@/src/store/redux/store";
import { colors } from "@/src/styles/colors";
import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";
import { useGetNotificationsQuery } from "@/src/store/redux/services/api/notificationsApi";
import CreateActionModal from "./CreateActionModal";
import { router } from "expo-router";
import { Routers } from "@/src/constants/routers";
import ProfileLinkModal from "@/src/components/app/root/homeHeader/ProfileLinkModal";
import BellPinActiveIcon from "@/src/components/app/root/homeHeader/BellPinActiveIcon";

const HomeHeader = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [profileActionsVisible, setProfileActionsVisible] = useState(false);
  const auth = useRequiredAuth();
  const user = useAppSelector((s) => s.auth.user);
  const { data: notificationsData } = useGetNotificationsQuery(
    auth ? { per_count: 1, is_read: false } : skipToken,
  );
  const unreadCount = notificationsData?.unread_count ?? 0;
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

  const handleOpenHistory = useCallback(() => {
    router.push(Routers.app.history.root);
  }, []);

  const handleOpenLink = useCallback(() => {
    if (!profileUrl) return;
    void WebBrowser.openBrowserAsync(profileUrl);
  }, [profileUrl]);

  return (
    <View className="flex-row items-center justify-between px-screen py-2.5">
      <View className="flex-1 flex-row items-center gap-3 mr-3">
        <Pressable onPress={handleOpenProfile} className="active:opacity-70">
          <Avatar
            uri={user?.avatar_url ?? undefined}
            blurhash={user?.avatar_blurhash}
            name={fullName}
            size="md"
          />
        </Pressable>

        <Pressable
          onPress={() => setProfileActionsVisible(true)}
          className="flex-1 active:opacity-70"
        >
          <Typography weight="semibold" className="text-body" numberOfLines={1}>
            {fullName}
          </Typography>
          <View className="flex-row items-center gap-1">
            <Typography
              className="text-caption text-neutral-500 shrink"
              numberOfLines={1}
            >
              {profileLink ?? "-"}
            </Typography>
            {profileLink && (
              <Pressable onPress={handleOpenLink} hitSlop={8}>
                <View style={{ transform: [{ rotate: "90deg" }] }}>
                  <StSvg
                    name="Out_light"
                    size={18}
                    color={colors.neutral[500]}
                  />
                </View>
              </Pressable>
            )}
          </View>
        </Pressable>
      </View>

      <View className="flex-row items-center gap-2">
        <IconButton
          onPress={handleOpenHistory}
          icon={
            unreadCount > 0 ? (
              <BellPinActiveIcon size={24} />
            ) : (
              <StSvg name="Bell_fill" size={24} color={colors.neutral[900]} />
            )
          }
        />
        <IconButton
          onPress={() => setModalVisible(true)}
          icon={
            <StSvg
              name="Add_round"
              size={24}
              color={colors.primary.blue[500]}
            />
          }
        />
      </View>

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
