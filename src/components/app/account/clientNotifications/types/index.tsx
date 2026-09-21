import React, { useCallback, useMemo } from "react";
import {
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  View,
} from "react-native";
import { skipToken } from "@reduxjs/toolkit/query";
import { router } from "expo-router";

import ScreenWithToolbar from "@/src/components/shared/layout/screenWithToolbar";
import { Divider, StSvg, Typography } from "@/src/components/ui";
import { ErrorScreen } from "@/src/components/shared/emptyStateScreen";
import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";
import { useRefresh } from "@/src/hooks/useRefresh";
import { safeRefetch } from "@/src/utils/safeRefetch";
import { useGetNotificationTemplatesQuery } from "@/src/store/redux/services/api/notificationTemplatesApi";
import { colors } from "@/src/styles/colors";
import { Routers } from "@/src/constants/routers";
import type { NotificationTemplateRow } from "@/src/store/redux/services/api-types";
import {
  STAGE_ORDER,
  STAGE_TITLES,
} from "@/src/components/app/account/clientNotifications/stageTitles";
import NotificationTypesSkeleton from "./NotificationTypesSkeleton";

type Section = {
  key: string;
  title: string;
  rows: NotificationTemplateRow[];
};

const NotificationTypes = () => {
  const auth = useRequiredAuth();

  const { data, isLoading, isError, isFetching, refetch } =
    useGetNotificationTemplatesQuery(auth ? auth.userId : skipToken);

  const refetchAll = useCallback(() => safeRefetch(refetch), [refetch]);
  const { refreshing, onRefresh } = useRefresh(refetchAll);

  const rows = useMemo(() => data?.notification_templates ?? [], [data]);

  const sections = useMemo<Section[]>(
    () =>
      STAGE_ORDER.map((stage) => ({
        key: stage,
        title: STAGE_TITLES[stage],
        rows: rows.filter((row) => row.stage === stage),
      })).filter((section) => section.rows.length > 0),
    [rows],
  );

  return (
    <ScreenWithToolbar title="Виды уведомлений">
      {({ topInset, bottomInset }) => {
        if (isLoading) {
          return (
            <View className="px-screen" style={{ marginTop: topInset }}>
              <NotificationTypesSkeleton />
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
            {sections.map((section) => (
              <View key={section.key} className="mb-5">
                <Typography className="text-caption text-neutral-500 mb-2">
                  {section.title}
                </Typography>

                <View className="bg-background-surface rounded-base overflow-hidden">
                  {section.rows.map((row, ii) => (
                    <React.Fragment key={row.kind}>
                      {ii > 0 && <Divider className="mx-4" />}
                      <Pressable
                        className="flex-row items-center justify-between px-4 py-3 active:opacity-70"
                        onPress={() =>
                          router.push(
                            Routers.app.account.clientNotifications.detail(
                              row.kind,
                            ),
                          )
                        }
                      >
                        <View>
                          <Typography weight="medium" className="text-body">
                            {row.title}
                          </Typography>
                          <Typography
                            weight="regular"
                            className={`text-caption ${row.enabled ? "text-primary-green-600" : "text-neutral-400"}`}
                          >
                            {row.enabled ? "Включено" : "Выключено"}
                          </Typography>
                        </View>
                        <StSvg
                          name="Expand_right_light"
                          size={24}
                          color={colors.neutral[900]}
                        />
                      </Pressable>
                    </React.Fragment>
                  ))}
                </View>
              </View>
            ))}
          </ScrollView>
        );
      }}
    </ScreenWithToolbar>
  );
};

export default NotificationTypes;
