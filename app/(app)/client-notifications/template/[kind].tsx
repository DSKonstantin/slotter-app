import React from "react";
import { useLocalSearchParams } from "expo-router";

import MessageTemplateScreen from "@/src/components/app/account/clientNotifications/templates/MessageTemplateScreen";

const MessageTemplatePage = () => {
  const { kind } = useLocalSearchParams<{ kind: string }>();

  return <MessageTemplateScreen kind={kind} />;
};

export default MessageTemplatePage;
