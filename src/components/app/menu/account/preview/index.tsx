import React, { useCallback } from "react";
import { RefreshControl, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { skipToken } from "@reduxjs/toolkit/query";
import { useAppSelector } from "@/src/store/redux/store";
import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";
import { useGetServiceCategoriesInfiniteQuery } from "@/src/store/redux/services/api/serviceCategoriesApi";
import { useRefresh } from "@/src/hooks/useRefresh";
import { colors } from "@/src/styles/colors";
import ToolbarTop from "@/src/components/navigation/toolbarTop";
import ParallaxScrollView from "@/src/components/parallaxScrollView";
import {
  PreviewHeaderImage,
  PreviewHeaderContent,
} from "@/src/components/app/menu/account/preview/header";
import PreviewLinks from "@/src/components/app/menu/account/preview/links";
import { BottomSheetHandle, IconButton, StSvg } from "@/src/components/ui";
import Booking from "@/src/components/app/menu/account/preview/booking";
import Services from "@/src/components/app/menu/account/preview/services";
import Footer from "@/src/components/app/menu/account/preview/footer";

const AccountPreview = () => {
  const user = useAppSelector((s) => s.auth.user);
  const auth = useRequiredAuth();
  const { bottom } = useSafeAreaInsets();

  const { refetch } = useGetServiceCategoriesInfiniteQuery(
    auth
      ? { userId: auth.userId, params: { view: "public_profile" } }
      : skipToken,
  );

  const handleRefetch = useCallback(() => {
    return refetch({ refetchCachedPages: false });
  }, [refetch]);

  const { refreshing, onRefresh } = useRefresh(handleRefetch);

  if (!user) return null;

  return (
    <View className="flex-1">
      <ToolbarTop
        title="Режим просмотра"
        rightButton={
          <IconButton
            icon={
              <StSvg name="link_alt" size={28} color={colors.neutral[900]} />
            }
            onPress={() => {}}
          />
        }
      />
      <ParallaxScrollView
        headerImage={<PreviewHeaderImage photos={user.gallery_photos} />}
        headerContent={<PreviewHeaderContent user={user} />}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        headerBackgroundColor={{
          light: colors.background.DEFAULT,
          dark: colors.background.DEFAULT,
        }}
        headerHeight={500}
        contentInset={{ bottom: bottom }}
      >
        <View className="gap-7 pt-2">
          <BottomSheetHandle />
          <Booking />
          <Services />
          <PreviewLinks user={user} />
          <Footer />
        </View>
      </ParallaxScrollView>
    </View>
  );
};

export default AccountPreview;
