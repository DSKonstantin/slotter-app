import React from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppSelector } from "@/src/store/redux/store";
import { colors } from "@/src/styles/colors";
import ToolbarTop from "@/src/components/navigation/toolbarTop";
import ParallaxScrollView from "@/src/components/parallaxScrollView";
import {
  PreviewHeaderImage,
  PreviewHeaderContent,
} from "@/src/components/app/menu/account/preview/header";
import PreviewLinks from "@/src/components/app/menu/account/preview/links";
import { BottomSheetHandle } from "@/src/components/ui";
import Booking from "@/src/components/app/menu/account/preview/booking";
import Services from "@/src/components/app/menu/account/preview/services";
import Footer from "@/src/components/app/menu/account/preview/footer";

const AccountPreview = () => {
  const user = useAppSelector((s) => s.auth.user);
  const { bottom } = useSafeAreaInsets();

  if (!user) return null;

  const links: string[] = user.personal_link ? [user.personal_link] : [];

  const hasLinks = links.length > 0;

  return (
    <View className="flex-1">
      <ParallaxScrollView
        headerImage={<PreviewHeaderImage uri={user.avatar_url ?? undefined} />}
        headerContent={<PreviewHeaderContent user={user} />}
        headerBackgroundColor={{
          light: colors.background.DEFAULT,
          dark: colors.background.DEFAULT,
        }}
        headerHeight={500}
        contentInset={{ bottom: bottom + 80 }}
      >
        <View className="gap-5 pt-2 px-screen">
          <BottomSheetHandle />

          <Booking />

          <Services />

          {hasLinks && <PreviewLinks links={links} />}

          <Footer />
        </View>
      </ParallaxScrollView>

      <ToolbarTop title="Режим просмотра" />
    </View>
  );
};

export default AccountPreview;
