import React, { useCallback, useMemo } from "react";
import { ActivityIndicator, Pressable, ScrollView, View } from "react-native";
import { skipToken } from "@reduxjs/toolkit/query";
import { router } from "expo-router";
import { toast } from "@backpackapp-io/react-native-toast";

import ScreenWithToolbar from "@/src/components/shared/layout/screenWithToolbar";
import RetryInline from "@/src/components/shared/retryInline";
import { Divider, Item, StSvg, Switch, Typography } from "@/src/components/ui";
import { ErrorScreen } from "@/src/components/shared/emptyStateScreen";
import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";
import {
  useGetNotificationSettingsQuery,
  useUpdateNotificationSettingsMutation,
} from "@/src/store/redux/services/api/notificationsApi";
import { useGetNotificationTemplatesQuery } from "@/src/store/redux/services/api/notificationTemplatesApi";
import { colors } from "@/src/styles/colors";
import { Routers } from "@/src/constants/routers";
import { getApiErrorMessage } from "@/src/utils/apiError";
import { asArray } from "@/src/utils/asArray";
import type {
  NotificationKind,
  NotificationSetting,
  NotificationTemplateRow,
} from "@/src/store/redux/services/api-types";
import {
  STAGE_ORDER,
  STAGE_TITLES,
} from "@/src/components/app/account/clientNotifications/templates/stageTitles";

const KNOWN_STAGES = new Set<string>(STAGE_ORDER);

type SectionEntry =
  | { type: "template"; row: NotificationTemplateRow }
  | { type: "other"; item: NotificationSetting };

type Section = {
  key: string;
  title: string;
  entries: SectionEntry[];
};

const NotificationTypes = () => {
  const auth = useRequiredAuth();

  const { data, isLoading, isError, isFetching, refetch } =
    useGetNotificationTemplatesQuery(auth ? auth.userId : skipToken);

  const {
    data: settingsData,
    isError: isSettingsError,
    isFetching: isSettingsFetching,
    refetch: refetchSettings,
  } = useGetNotificationSettingsQuery(auth ? auth.userId : skipToken);

  const [updateSettings] = useUpdateNotificationSettingsMutation();

  const rows = useMemo(() => data?.notification_templates ?? [], [data]);

  const sections = useMemo<Section[]>(() => {
    const templateKinds = new Set<NotificationKind>(rows.map((r) => r.kind));
    const settingsGroups = asArray(settingsData?.customer);

    const known = STAGE_ORDER.map((stage) => {
      const settingsGroup = settingsGroups.find((g) => g.stage === stage);
      const otherItems = asArray(settingsGroup?.items).filter(
        (item) => !templateKinds.has(item.kind),
      );
      const entries: SectionEntry[] = [
        ...rows
          .filter((row) => row.stage === stage)
          .map((row): SectionEntry => ({ type: "template", row })),
        ...otherItems.map((item): SectionEntry => ({ type: "other", item })),
      ];
      return { key: stage, title: STAGE_TITLES[stage], entries };
    });

    const extra = settingsGroups
      .filter((g) => !KNOWN_STAGES.has(g.stage))
      .map((g): Section => ({
        key: g.stage,
        title: g.title,
        entries: asArray(g.items)
          .filter((item) => !templateKinds.has(item.kind))
          .map((item): SectionEntry => ({ type: "other", item })),
      }));

    return [...known, ...extra].filter((s) => s.entries.length > 0);
  }, [rows, settingsData]);

  const handleToggleOther = useCallback(
    (kind: NotificationKind, currentEnabled: boolean) => {
      if (!auth) return;
      updateSettings({
        userId: auth.userId,
        customer: { [kind]: !currentEnabled },
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
              topInset={topInset}
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
            {sections.map((section) => (
              <View key={section.key} className="mb-5">
                <Typography className="text-caption text-neutral-500 mb-2">
                  {section.title}
                </Typography>

                <View className="bg-background-surface rounded-base overflow-hidden">
                  {section.entries.map((entry, ii) => (
                    <React.Fragment
                      key={
                        entry.type === "template"
                          ? entry.row.kind
                          : entry.item.kind
                      }
                    >
                      {ii > 0 && <Divider className="mx-4" />}
                      {entry.type === "template" ? (
                        <Pressable
                          className="flex-row items-center justify-between px-4 py-3 active:opacity-70"
                          onPress={() =>
                            router.push(
                              Routers.app.account.clientNotifications.detail(
                                entry.row.kind,
                              ),
                            )
                          }
                        >
                          <View>
                            <Typography weight="medium" className="text-body">
                              {entry.row.title}
                            </Typography>
                            <Typography
                              weight="regular"
                              className={`text-caption ${entry.row.enabled ? "text-primary-green-600" : "text-neutral-400"}`}
                            >
                              {entry.row.enabled ? "Включено" : "Выключено"}
                            </Typography>
                          </View>
                          <StSvg
                            name="Expand_right_light"
                            size={24}
                            color={colors.neutral[900]}
                          />
                        </Pressable>
                      ) : (
                        <Item
                          title={entry.item.title}
                          className="border-0"
                          right={
                            <Switch
                              value={entry.item.enabled}
                              onChange={() =>
                                handleToggleOther(
                                  entry.item.kind,
                                  entry.item.enabled,
                                )
                              }
                            />
                          }
                        />
                      )}
                    </React.Fragment>
                  ))}
                </View>
              </View>
            ))}

            {isSettingsError && !settingsData && (
              <RetryInline
                text="Не удалось загрузить остальные виды"
                onRetry={refetchSettings}
                isLoading={isSettingsFetching}
                className="mb-5"
              />
            )}
          </ScrollView>
        );
      }}
    </ScreenWithToolbar>
  );
};

export default NotificationTypes;
