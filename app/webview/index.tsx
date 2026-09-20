import React from "react";
import { useLocalSearchParams } from "expo-router";
import WebViewScreen from "@/src/components/app/webview";

const WebViewPage = () => {
  const { url, title } = useLocalSearchParams<{
    url: string;
    title?: string;
  }>();

  return <WebViewScreen url={url} title={title} />;
};

export default WebViewPage;
