import React, { useCallback, useRef, useState } from "react";
import { ActivityIndicator, Share, View } from "react-native";
import { WebView } from "react-native-webview";
import { useAppSelector } from "@/src/store/redux/store";
import { colors } from "@/src/styles/colors";
import ToolbarTop from "@/src/components/navigation/toolbarTop";
import { IconButton, StSvg } from "@/src/components/ui";
import { TOOLBAR_HEIGHT } from "@/src/constants/tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const AccountPreview = () => {
  const id = useAppSelector((s) => s.auth.user?.id);
  const insets = useSafeAreaInsets();
  const webViewRef = useRef<WebView>(null);
  const [isLoading, setIsLoading] = useState(true);

  const shareUrl = `${process.env.EXPO_PUBLIC_BOOKING_BASE_URL}/${id}`;
  const previewUrl = `${shareUrl}?preview=mobile`;

  const handleShare = useCallback(async () => {
    try {
      await Share.share({ message: shareUrl });
    } catch {}
  }, [shareUrl]);

  if (!id) return null;

  return (
    <View className="flex-1 bg-background">
      <ToolbarTop
        title="Режим просмотра"
        rightButton={
          <IconButton
            icon={
              <StSvg name="link_alt" size={28} color={colors.neutral[900]} />
            }
            onPress={handleShare}
          />
        }
      />
      <View
        className="flex-1"
        style={{
          marginTop: TOOLBAR_HEIGHT + insets.top,
          marginBottom: insets.bottom,
        }}
      >
        <WebView
          ref={webViewRef}
          source={{ uri: previewUrl }}
          onLoadEnd={() => setIsLoading(false)}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          allowsBackForwardNavigationGestures={false}
          onShouldStartLoadWithRequest={(req) => req.navigationType !== "click"}
        />
        {isLoading && (
          <View className="absolute inset-0 items-center justify-center bg-background">
            <ActivityIndicator size="large" color={colors.neutral[400]} />
          </View>
        )}
      </View>
    </View>
  );
};

export default AccountPreview;
