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
import { useAppSelector } from "@/src/store/redux/store";
import {
  useGetNotificationTemplatesQuery,
  useGetNotificationTemplateVariablesQuery,
  usePreviewNotificationTemplateMutation,
  useResetNotificationTemplateMutation,
  useSaveNotificationTemplateMutation,
} from "@/src/store/redux/services/api/notificationTemplatesApi";
import { getApiErrorMessage } from "@/src/utils/apiError";
import type { NotificationTemplateKind } from "@/src/store/redux/services/api-types";
import ConnectChannelModal from "@/src/components/app/clients/broadcast/ConnectChannelModal";
import MessageTemplateEditor from "./editor/MessageTemplateEditor";
import { useDirectChannelErrorGate } from "./useDirectChannelErrorGate";

type MessageTemplateScreenProps = {
  kind: NotificationTemplateKind;
};

const MessageTemplateScreen = ({ kind }: MessageTemplateScreenProps) => {
  const [serverError, setServerError] = useState<string | null>(null);
  const [serverErrorText, setServerErrorText] = useState<string | null>(null);
  const [bypassGuard, setBypassGuard] = useState(false);

  const auth = useRequiredAuth();
  const openPersonalAccount = useOpenPersonalAccount();
  const ispe = useAppSelector((state) => state.appVersion.ispe);
  const {
    channelModalVisible,
    setChannelModalVisible,
    guardDirectChannelError,
  } = useDirectChannelErrorGate();

  const { data: templatesData, isLoading: isRowLoading } =
    useGetNotificationTemplatesQuery(auth ? auth.userId : skipToken);
  const { data: variablesData, isLoading: isVariablesLoading } =
    useGetNotificationTemplateVariablesQuery(kind, {
      refetchOnMountOrArgChange: true,
    });
  const [saveTemplate, { isLoading: isSaving }] =
    useSaveNotificationTemplateMutation();
  const [previewTemplate, { isLoading: isPreviewing }] =
    usePreviewNotificationTemplateMutation();
  const [resetTemplate, { isLoading: isResetting }] =
    useResetNotificationTemplateMutation();

  const row = templatesData?.notification_templates.find(
    (r) => r.kind === kind,
  );
  const variables = variablesData?.notification_template_variables ?? [];

  const handleSave = useCallback(
    (text: string) => {
      if (!auth || !row) return;
      setServerError(null);
      setServerErrorText(null);
      previewTemplate({ userId: auth.userId, kind, body: text })
        .unwrap()
        .then(() =>
          saveTemplate({
            userId: auth.userId,
            kind,
            channel: row.channel ?? "auto",
            body: text,
          }).unwrap(),
        )
        .then(() => {
          toast.success("Шаблон сохранён");
          setBypassGuard(true);
          router.back();
        })
        .catch((e: unknown) => {
          guardDirectChannelError(e, (err) => {
            setServerError(
              getApiErrorMessage(err, "Не удалось сохранить шаблон"),
            );
            setServerErrorText(text);
          });
        });
    },
    [auth, row, kind, previewTemplate, saveTemplate, guardDirectChannelError],
  );

  const handleReset = useCallback(() => {
    if (!auth) return;
    resetTemplate({ userId: auth.userId, kind })
      .unwrap()
      .then(() => {
        toast.success("Шаблон сброшен");
      })
      .catch((e: unknown) => {
        guardDirectChannelError(e, (err) =>
          toast.error(getApiErrorMessage(err, "Не удалось сбросить шаблон")),
        );
      });
  }, [auth, kind, resetTemplate, guardDirectChannelError]);

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
        initialValue={row.body || row.default_body || ""}
        fallbackPreview={row.preview}
        variables={variables}
        senderName="Ваше имя"
        isSaving={isSaving || isPreviewing}
        bypassGuard={bypassGuard}
        serverError={serverError}
        serverErrorText={serverErrorText}
        onSave={handleSave}
        onReset={row.is_custom ? handleReset : undefined}
        isResetting={isResetting}
      />
      <ConnectChannelModal
        visible={channelModalVisible}
        onClose={() => setChannelModalVisible(false)}
        onConnect={
          ispe ? () => openPersonalAccount("/go/notifications") : undefined
        }
      />
    </>
  );
};

export default MessageTemplateScreen;
