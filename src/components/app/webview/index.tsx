import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import type {
  WebViewErrorEvent,
  WebViewHttpErrorEvent,
} from "react-native-webview/lib/WebViewTypes";
import ScreenWithToolbar from "@/src/components/shared/layout/screenWithToolbar";
import RetryInline from "@/src/components/shared/retryInline";
import { colors } from "@/src/styles/colors";

type Props = {
  url: string;
  title?: string;
};

const WebViewScreen = ({ url, title }: Props) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const { bottom } = useSafeAreaInsets();

  // Reset stale error/loading state left over from a previous url when the
  // screen instance is reused for a new navigation instead of remounting.
  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
  }, [url]);

  const handleRetry = () => {
    setHasError(false);
    setIsLoading(true);
    setReloadKey((key) => key + 1);
  };

  return (
    <ScreenWithToolbar title={title ?? null}>
      {({ topInset }) => (
        <View
          className="flex-1"
          style={{ paddingTop: topInset, paddingBottom: bottom }}
        >
          {hasError ? (
            <View className="flex-1 items-center justify-center px-screen">
              <RetryInline
                text="Не удалось загрузить страницу"
                onRetry={handleRetry}
                layout="column"
              />
            </View>
          ) : (
            <>
              <WebView
                key={reloadKey}
                source={{ uri: url }}
                style={{ flex: 1 }}
                onLoadEnd={() => setIsLoading(false)}
                onError={(e: WebViewErrorEvent) => {
                  console.warn("[WebView] onError", url, e.nativeEvent);
                  setIsLoading(false);
                  setHasError(true);
                }}
                onHttpError={(e: WebViewHttpErrorEvent) => {
                  console.warn("[WebView] onHttpError", url, e.nativeEvent);
                  setIsLoading(false);
                  setHasError(true);
                }}
              />
              {isLoading && (
                <View className="absolute inset-0 items-center justify-center bg-background">
                  <ActivityIndicator size="large" color={colors.neutral[400]} />
                </View>
              )}
            </>
          )}
        </View>
      )}
    </ScreenWithToolbar>
  );
};

export default WebViewScreen;
