import React, { useCallback, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { skipToken } from "@reduxjs/toolkit/query";
import { router } from "expo-router";
import { toast } from "@backpackapp-io/react-native-toast";

import ScreenWithToolbar from "@/src/components/shared/layout/screenWithToolbar";
import { Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";
import { useOpenPersonalAccount } from "@/src/hooks/useOpenPersonalAccount";
import {
  useGetNotificationTemplatesQuery,
  useGetNotificationTemplateVariablesQuery,
  useSaveNotificationTemplateMutation,
} from "@/src/store/redux/services/api/notificationTemplatesApi";
import {
  getApiErrorMessage,
  isDirectChannelRequired,
} from "@/src/utils/apiError";
import type { NotificationTemplateKind } from "@/src/store/redux/services/api-types";
import ConnectChannelModal from "@/src/components/app/clients/broadcast/ConnectChannelModal";
import MessageTemplateEditor from "./MessageTemplateEditor";

type MessageTemplateScreenProps = {
  kind: NotificationTemplateKind;
};

const MessageTemplateScreen = ({ kind }: MessageTemplateScreenProps) => {
  const [serverError, setServerError] = useState<string | null>(null);
  const [channelModalVisible, setChannelModalVisible] = useState(false);

  const auth = useRequiredAuth();
  const openPersonalAccount = useOpenPersonalAccount();

  const { data: templatesData, isLoading: isRowLoading } =
    useGetNotificationTemplatesQuery(auth ? auth.userId : skipToken);
  const { data: variablesData, isLoading: isVariablesLoading } =
    useGetNotificationTemplateVariablesQuery(kind);
  const [saveTemplate, { isLoading: isSaving }] =
    useSaveNotificationTemplateMutation();

  const row = templatesData?.notification_templates.find(
    (r) => r.kind === kind,
  );
  const variables = variablesData?.notification_template_variables ?? [];

  const handleSave = useCallback(
    (text: string) => {
      if (!auth || !row) return;
      setServerError(null);
      saveTemplate({
        userId: auth.userId,
        kind,
        channel: row.channel ?? "auto",
        body: text,
      })
        .unwrap()
        .then(() => {
          toast.success("Шаблон сохранён");
          router.back();
        })
        .catch((e: unknown) => {
          if (isDirectChannelRequired(e)) {
            setChannelModalVisible(true);
            return;
          }
          setServerError(getApiErrorMessage(e, "Не удалось сохранить шаблон"));
        });
    },
    [auth, row, kind, saveTemplate],
  );

  if (isRowLoading || isVariablesLoading || !row) {
    return (
      <ScreenWithToolbar title="Шаблон сообщения">
        {() => (
          <View className="flex-1 items-center justify-center">
            {isRowLoading || isVariablesLoading ? (
              <ActivityIndicator color={colors.neutral[400]} />
            ) : (
              <Typography className="text-center text-accent-red-500 px-screen">
                Неизвестный тип шаблона
              </Typography>
            )}
          </View>
        )}
      </ScreenWithToolbar>
    );
  }

  return (
    <>
      <MessageTemplateEditor
        initialValue={row.body ?? ""}
        variables={variables}
        senderName="Ваше имя"
        isSaving={isSaving}
        serverError={serverError}
        onSave={handleSave}
      />
      <ConnectChannelModal
        visible={channelModalVisible}
        onClose={() => setChannelModalVisible(false)}
        onConnect={() => openPersonalAccount("/notifications")}
      />
    </>
  );
};

export default MessageTemplateScreen;
