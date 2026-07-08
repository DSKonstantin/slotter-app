import React, { useCallback } from "react";
import { ActivityIndicator, Pressable, ScrollView, View } from "react-native";
import { skipToken } from "@reduxjs/toolkit/query";
import { router } from "expo-router";
import { toast } from "@backpackapp-io/react-native-toast";

import ScreenWithToolbar from "@/src/components/shared/layout/screenWithToolbar";
import { Divider, StSvg, Switch, Typography } from "@/src/components/ui";
import { ErrorScreen } from "@/src/components/shared/emptyStateScreen";
import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";
import {
  useGetNotificationSettingsQuery,
  useUpdateNotificationSettingsMutation,
} from "@/src/store/redux/services/api/notificationsApi";
import type { NotificationKind } from "@/src/store/redux/services/api-types";
import { getApiErrorMessage } from "@/src/utils/apiError";
import { colors } from "@/src/styles/colors";
import {
  NOTIFICATION_KIND_CONFIG,
  NOTIFICATION_SECTIONS,
} from "@/src/constants/notificationKinds";

const NotificationTypes = () => {
  const auth = useRequiredAuth();

  const { data, isLoading, isError, isFetching, refetch } =
    useGetNotificationSettingsQuery(auth ? auth.userId : skipToken);

  const [updateSettings] = useUpdateNotificationSettingsMutation();

  const settingsMap = React.useMemo(() => {
    const map: Partial<Record<NotificationKind, { enabled: boolean }>> = {};
    data?.notification_settings.forEach((s) => {
      map[s.kind] = { enabled: s.enabled };
    });
    return map;
  }, [data]);

  const handleToggle = useCallback(
    (kind: NotificationKind, currentEnabled: boolean) => {
      if (!auth) return;
      updateSettings({
        userId: auth.userId,
        settings: { [kind]: !currentEnabled },
      })
        .unwrap()
        .catch((e: unknown) => {
          toast.error(getApiErrorMessage(e, "Не удалось сохранить настройки"));
        });
    },
    [auth, updateSettings],
  );

  return (
    <ScreenWithToolbar title="Виды уведомлений">
      {({ topInset, bottomInset }) => {
        if (isLoading) {
          return (
            <View
              className="flex-1 items-center justify-center"
              style={{ marginTop: topInset }}
            >
              <ActivityIndicator />
            </View>
          );
        }

        if (isError && !data) {
          return (
            <ErrorScreen
              title="Не удалось загрузить настройки"
              isLoading={isFetching}
              onRetry={refetch}
            />
          );
        }

        return (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingTop: topInset,
              paddingBottom: bottomInset + 8,
            }}
            className="px-screen"
          >
            {NOTIFICATION_SECTIONS.map((group) => {
              const visibleItems = group.kinds
                .map((kind) => ({ kind, ...settingsMap[kind] }))
                .filter((item) => item.enabled !== undefined);

              if (visibleItems.length === 0) return null;

              return (
                <View key={group.section} className="mb-5">
                  <Typography className="text-caption text-neutral-500 mb-2">
                    {group.section}
                  </Typography>

                  <View className="bg-background-surface rounded-base px-4">
                    {visibleItems.map((item, ii) => {
                      const kindConfig = NOTIFICATION_KIND_CONFIG[item.kind];
                      const detailRoute = kindConfig?.detailRoute;
                      return (
                        <React.Fragment key={item.kind}>
                          {ii > 0 && <Divider />}
                          <Pressable
                            className="flex-row items-center justify-between py-3 active:opacity-70"
                            onPress={
                              detailRoute
                                ? () => router.push(detailRoute as any)
                                : undefined
                            }
                          >
                            <View>
                              <Typography weight="medium" className="text-body">
                                {kindConfig?.title ?? item.kind}
                              </Typography>
                              <Typography
                                weight="regular"
                                className={`text-caption ${item.enabled ? "text-primary-green-600" : "text-neutral-400"}`}
                              >
                                {item.enabled ? "Включено" : "Выключено"}
                              </Typography>
                            </View>
                            {detailRoute ? (
                              <StSvg
                                name="Expand_right_light"
                                size={24}
                                color={colors.neutral[900]}
                              />
                            ) : (
                              <Switch
                                value={item.enabled!}
                                onChange={() =>
                                  handleToggle(item.kind, item.enabled!)
                                }
                              />
                            )}
                          </Pressable>
                        </React.Fragment>
                      );
                    })}
                  </View>
                </View>
              );
            })}
          </ScrollView>
        );
      }}
    </ScreenWithToolbar>
  );
};

export default NotificationTypes;
