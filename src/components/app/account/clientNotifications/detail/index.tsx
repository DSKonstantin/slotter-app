import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  View,
} from "react-native";
import { skipToken } from "@reduxjs/toolkit/query";
import { router } from "expo-router";
import { toast } from "@backpackapp-io/react-native-toast";

import ScreenWithToolbar from "@/src/components/shared/layout/screenWithToolbar";
import RetryInline from "@/src/components/shared/retryInline";
import { colors } from "@/src/styles/colors";
import { Routers } from "@/src/constants/routers";
import { Divider, StSvg, Switch, Typography } from "@/src/components/ui";
import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";
import { useRefresh } from "@/src/hooks/useRefresh";
import { safeRefetch } from "@/src/utils/safeRefetch";
import { useAppSelector } from "@/src/store/redux/store";
import { useUpdateNotificationSettingsMutation } from "@/src/store/redux/services/api/notificationsApi";
import { useGetNotificationTemplatesQuery } from "@/src/store/redux/services/api/notificationTemplatesApi";
import { useUpdateUserMutation } from "@/src/store/redux/services/api/usersApi";
import { getApiErrorMessage } from "@/src/utils/apiError";
import type { NotificationTemplateKind } from "@/src/store/redux/services/api-types";
import RebookDaysModal from "./RebookDaysModal";

type ToggleRowProps = {
  title: string;
  description: string;
  value: boolean;
  onChange: () => void;
};

const ToggleRow = ({ title, description, value, onChange }: ToggleRowProps) => (
  <View className="flex-row items-start justify-between gap-3 p-4">
    <View className="flex-1">
      <Typography className="text-body">{title}</Typography>
      <Typography
        weight="regular"
        className="text-caption text-neutral-500 mt-1"
      >
        {description}
      </Typography>
    </View>
    <Switch value={value} onChange={onChange} />
  </View>
);

type Props = { kind: NotificationTemplateKind };

const NotificationDetailScreen = ({ kind }: Props) => {
  const [daysModalVisible, setDaysModalVisible] = useState(false);

  const auth = useRequiredAuth();
  const user = useAppSelector((s) => s.auth.user);

  const { data, isLoading, isFetching, isError, refetch } =
    useGetNotificationTemplatesQuery(auth ? auth.userId : skipToken);

  const [updateSettings] = useUpdateNotificationSettingsMutation();
  const [updateUser] = useUpdateUserMutation();

  const row = data?.notification_templates.find((r) => r.kind === kind);
  const rebookDaysOptions = data?.rebook_days_options ?? [];

  const handleToggle = useCallback(() => {
    if (!auth || !row) return;
    updateSettings({
      userId: auth.userId,
      customer: { [kind]: !row.enabled },
    })
      .unwrap()
      .catch((e: unknown) => {
        toast.error(getApiErrorMessage(e, "Не удалось сохранить настройки"));
      });
  }, [auth, row, updateSettings, kind]);

  const handleConsentToggle = useCallback(() => {
    if (!auth || !user) return;
    updateUser({
      id: auth.userId,
      data: {
        is_marketing_consent_enabled: !user.is_marketing_consent_enabled,
      },
    })
      .unwrap()
      .catch((e: unknown) => {
        toast.error(getApiErrorMessage(e, "Не удалось сохранить настройки"));
      });
  }, [auth, user, updateUser]);

  const handleSelectDays = useCallback(
    (days: number) => {
      if (!auth) return;
      setDaysModalVisible(false);
      updateUser({ id: auth.userId, data: { rebook_days_count: days } })
        .unwrap()
        .catch((e: unknown) => {
          toast.error(getApiErrorMessage(e, "Не удалось сохранить настройки"));
        });
    },
    [auth, updateUser],
  );

  const refetchAll = useCallback(async () => {
    await safeRefetch(refetch);
  }, [refetch]);

  const { refreshing, onRefresh } = useRefresh(refetchAll);

  return (
    <>
      <ScreenWithToolbar title={row?.title}>
        {({ topInset, bottomInset }) => (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentInset={Platform.OS === "ios" ? { top: topInset } : undefined}
            contentOffset={
              Platform.OS === "ios" ? { x: 0, y: -topInset } : undefined
            }
            contentContainerStyle={{
              paddingTop: Platform.OS === "ios" ? 0 : topInset,
              paddingBottom: bottomInset + 8,
            }}
            className="px-screen"
            refreshControl={
              <RefreshControl
                progressViewOffset={Platform.select({ android: topInset })}
                refreshing={refreshing}
                onRefresh={onRefresh}
              />
            }
          >
            <View className="bg-background-surface rounded-base overflow-hidden mb-5">
              {isLoading ? (
                <View className="items-center py-4">
                  <ActivityIndicator color={colors.neutral[400]} />
                </View>
              ) : isError && !row ? (
                <RetryInline
                  text="Не удалось загрузить настройки"
                  onRetry={refetch}
                  isLoading={isFetching}
                  className="p-4"
                />
              ) : row ? (
                <ToggleRow
                  title={row.switch_title}
                  description={row.description}
                  value={row.enabled}
                  onChange={handleToggle}
                />
              ) : null}
            </View>

            {kind === "appointment_reminder" && (
              <>
                <Typography className="text-caption text-neutral-500 mb-2">
                  Время отправки
                </Typography>
                <View className="bg-background-surface rounded-base overflow-hidden mb-5">
                  <View className="flex-row items-center justify-between p-4">
                    <Typography weight="regular" className="text-body">
                      При онлайн-записи
                    </Typography>
                    <Typography
                      weight="regular"
                      className="text-body text-neutral-500"
                    >
                      За 2 часа, За 24 часа
                    </Typography>
                  </View>
                </View>
              </>
            )}

            {kind === "rebook_suggestion" && user && (
              <>
                <Typography className="text-caption text-neutral-500 mb-2">
                  Дополнительно
                </Typography>
                <View className="bg-background-surface rounded-base overflow-hidden mb-5">
                  <ToggleRow
                    title="Только с согласием на рекламу"
                    description="Влияет на все уведомления о возвращаемости: повторный визит, день рождения, приглашение после отмены"
                    value={user.is_marketing_consent_enabled}
                    onChange={handleConsentToggle}
                  />
                  <Divider className="mx-4" />
                  <Pressable
                    onPress={() => setDaysModalVisible(true)}
                    className="flex-row items-center justify-between p-4 active:opacity-70"
                  >
                    <Typography className="text-body">
                      Отправлять через
                    </Typography>
                    <View className="flex-row gap-1 items-center">
                      <Typography
                        weight="regular"
                        className="text-body text-neutral-500"
                      >
                        {user.rebook_days_count} дней
                      </Typography>
                      <StSvg
                        name="Expand_down_light"
                        size={24}
                        color={colors.neutral[500]}
                      />
                    </View>
                  </Pressable>
                </View>
              </>
            )}

            {row && (
              <View style={{ opacity: row.enabled ? 1 : 0.4 }}>
                <Typography className="text-caption text-neutral-500 mb-2">
                  Текст уведомления
                </Typography>

                <View className="bg-background-surface rounded-base overflow-hidden mb-5">
                  <Pressable
                    onPress={() =>
                      router.push(
                        Routers.app.account.clientNotifications.editor(kind),
                      )
                    }
                    className="flex-row items-center p-4 active:opacity-70"
                  >
                    <View className="flex-1">
                      <Typography className="text-body">
                        Шаблон сообщения
                      </Typography>
                      <Typography
                        weight="regular"
                        numberOfLines={1}
                        className="text-caption text-neutral-500 mt-1"
                      >
                        {row.preview}
                      </Typography>
                    </View>
                    <StSvg
                      name="Expand_right_light"
                      size={24}
                      color={colors.neutral[300]}
                    />
                  </Pressable>
                </View>
              </View>
            )}
          </ScrollView>
        )}
      </ScreenWithToolbar>

      <RebookDaysModal
        visible={daysModalVisible}
        options={rebookDaysOptions}
        current={user?.rebook_days_count}
        onClose={() => setDaysModalVisible(false)}
        onSelect={handleSelectDays}
      />
    </>
  );
};

export default NotificationDetailScreen;
