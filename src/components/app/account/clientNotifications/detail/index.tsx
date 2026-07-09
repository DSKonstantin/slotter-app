import React, { useCallback } from "react";
import { ScrollView, View } from "react-native";
import { skipToken } from "@reduxjs/toolkit/query";
import { toast } from "@backpackapp-io/react-native-toast";

import ScreenWithToolbar from "@/src/components/shared/layout/screenWithToolbar";
import { Divider, Item, Switch, Typography } from "@/src/components/ui";
import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";
import {
  useGetNotificationSettingsQuery,
  useUpdateNotificationSettingsMutation,
} from "@/src/store/redux/services/api/notificationsApi";
import { getApiErrorMessage } from "@/src/utils/apiError";
import { asArray } from "@/src/utils/asArray";
import type { NotificationKind } from "@/src/store/redux/services/api-types";

type DetailKind = "reminder" | "reschedule";

const KIND_MAP: Record<DetailKind, NotificationKind> = {
  reminder: "appointment_reminder",
  reschedule: "appointment_rescheduled",
};

const CONFIG: Record<
  DetailKind,
  {
    toggleLabel: string;
    onlineTimeValue: string;
  }
> = {
  reminder: {
    toggleLabel: "Уведомление напоминания",
    onlineTimeValue: "За 2 часа, За день",
  },
  reschedule: {
    toggleLabel: "Уведомление переноса",
    onlineTimeValue: "За 2 часа, За день",
  },
};

type Props = { kind: DetailKind };

const NotificationDetailScreen = ({ kind }: Props) => {
  const config = CONFIG[kind];
  const notificationKind = KIND_MAP[kind];

  const auth = useRequiredAuth();

  const { data } = useGetNotificationSettingsQuery(
    auth ? auth.userId : skipToken,
  );

  const [updateSettings] = useUpdateNotificationSettingsMutation();

  const settingItem = asArray(data?.customer)
    .flatMap((group) => asArray(group.items))
    .find((s) => s.kind === notificationKind);

  const enabled = settingItem?.enabled ?? false;

  const handleToggle = useCallback(() => {
    if (!auth) return;
    updateSettings({
      userId: auth.userId,
      customer: { [notificationKind]: !enabled },
    })
      .unwrap()
      .catch((e: unknown) => {
        toast.error(getApiErrorMessage(e, "Не удалось сохранить настройки"));
      });
  }, [auth, updateSettings, notificationKind, enabled]);

  return (
    <ScreenWithToolbar title={settingItem?.title}>
      {({ topInset, bottomInset }) => (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingTop: topInset,
            paddingBottom: bottomInset + 8,
          }}
          className="px-screen"
        >
          <View className="bg-background-surface rounded-base overflow-hidden mb-5">
            <Item
              title={config.toggleLabel}
              right={<Switch value={enabled} onChange={handleToggle} />}
            />
          </View>

          <Typography className="text-caption text-neutral-500 mb-2">
            Время отправки
          </Typography>

          <View className="bg-background-surface rounded-base overflow-hidden mb-5">
            <Item
              title="При онлайн-записи"
              className="border-0"
              right={
                <Typography
                  weight="regular"
                  className="text-body text-neutral-500"
                >
                  {config.onlineTimeValue}
                </Typography>
              }
            />
            <Divider className="mx-4" />
            <Item
              title="При обычной записи"
              className="border-0"
              right={
                <View className="flex-row items-center">
                  <Typography
                    weight="regular"
                    className="text-body text-neutral-500"
                  >
                    Выключено
                  </Typography>
                </View>
              }
            />
          </View>
        </ScrollView>
      )}
    </ScreenWithToolbar>
  );
};

export default NotificationDetailScreen;
