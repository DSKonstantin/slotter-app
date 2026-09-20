import React from "react";
import { useLocalSearchParams } from "expo-router";

import MessageTemplateScreen from "@/src/components/app/account/clientNotifications/templates/MessageTemplateScreen";
import type { NotificationTemplateKind } from "@/src/store/redux/services/api-types";

const ClientNotificationEditorPage = () => {
  const { kind } = useLocalSearchParams<{ kind: NotificationTemplateKind }>();

  return <MessageTemplateScreen kind={kind} />;
};

export default ClientNotificationEditorPage;
