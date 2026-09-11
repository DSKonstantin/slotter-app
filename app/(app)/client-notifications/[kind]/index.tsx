import React from "react";
import { useLocalSearchParams } from "expo-router";

import NotificationDetailScreen from "@/src/components/app/account/clientNotifications/detail";
import type { NotificationTemplateKind } from "@/src/store/redux/services/api-types";

const ClientNotificationKindPage = () => {
  const { kind } = useLocalSearchParams<{ kind: NotificationTemplateKind }>();

  return <NotificationDetailScreen kind={kind} />;
};

export default ClientNotificationKindPage;
