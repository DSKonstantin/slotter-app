import React, { useState } from "react";
import { View } from "react-native";
import { Avatar, IconButton, StSvg, Typography } from "@/src/components/ui";
import { useAppSelector } from "@/src/store/redux/store";
import { colors } from "@/src/styles/colors";
import CreateActionModal from "./CreateActionModal";

const HomeHeader = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const user = useAppSelector((s) => s.auth.user);
  const fullName = [user?.first_name, user?.last_name]
    .filter(Boolean)
    .join(" ");
  const profileLink = user?.nickname
    ? `${process.env.EXPO_PUBLIC_BOOKING_DISPLAY_URL}/${user.nickname}`
    : null;

  return (
    <View className="flex-row items-center justify-between px-screen py-3">
      <View className="flex-row items-center gap-3 flex-1 mr-3">
        <Avatar uri={user?.avatar_url ?? undefined} name={fullName} size="md" />
        <View className="flex-1">
          <Typography weight="semibold" className="text-body" numberOfLines={1}>
            {fullName}
          </Typography>
          {profileLink && (
            <View className="flex-row items-center gap-1">
              <Typography className="text-caption text-neutral-500">
                {profileLink}
              </Typography>
              <View style={{ transform: [{ rotate: "90deg" }] }}>
                <StSvg name="Out_light" size={18} color={colors.neutral[500]} />
              </View>
            </View>
          )}
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
    </View>
  );
};

export default HomeHeader;
