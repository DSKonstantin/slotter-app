import React, { useCallback } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  View,
} from "react-native";
import { skipToken } from "@reduxjs/toolkit/query";
import { toast } from "@backpackapp-io/react-native-toast";

import ScreenWithToolbar from "@/src/components/shared/layout/screenWithToolbar";
import { ErrorScreen } from "@/src/components/shared/emptyStateScreen";
import { Badge, Button, FloatingFooter, Typography } from "@/src/components/ui";
import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";
import { useRefresh } from "@/src/hooks/useRefresh";
import { getApiErrorMessage } from "@/src/utils/apiError";
import {
  useCancelMarketingBroadcastMutation,
  useGetMarketingBroadcastQuery,
} from "@/src/store/redux/services/api/marketingBroadcastsApi";
import {
  getBroadcastBadge,
  getStopReasonLabel,
  isBroadcastCancellable,
  pct,
} from "./broadcastPresentation";

type StatTileProps = { label: string; value: string; color: string };

const StatTile = ({ label, value, color }: StatTileProps) => (
  <View className="flex-1 bg-background-surface p-4 rounded-base">
    <Typography weight="semibold" className={`text-4xl ${color}`}>
      {value}
    </Typography>
    <Typography weight="regular" className="text-caption text-neutral-500">
      {label}
    </Typography>
  </View>
);

type Props = { broadcastId: number };

const BroadcastDetailContent = ({
  broadcastId,
  topInset,
  bottomInset,
}: Props & { topInset: number; bottomInset: number }) => {
  const auth = useRequiredAuth();

  const { data, isLoading, isError, isFetching, refetch } =
    useGetMarketingBroadcastQuery(
      auth ? { userId: auth.userId, id: broadcastId } : skipToken,
      { refetchOnMountOrArgChange: true },
    );

  const [cancelBroadcast, { isLoading: isCancelling }] =
    useCancelMarketingBroadcastMutation();

  const { refreshing, onRefresh } = useRefresh(refetch);

  const broadcast = data?.marketing_broadcast;

  const handleCancel = useCallback(() => {
    if (!auth || !broadcast) return;
    Alert.alert(
      "Остановить неотправленное?",
      "Сообщения, которые уже ушли, вернуть нельзя.",
      [
        { text: "Не отправлять", style: "cancel" },
        {
          text: "Остановить",
          style: "destructive",
          onPress: () => {
            cancelBroadcast({ userId: auth.userId, id: broadcast.id })
              .unwrap()
              .catch((e: unknown) => {
                toast.error(
                  getApiErrorMessage(e, "Не удалось остановить рассылку"),
                );
                refetch();
              });
          },
        },
      ],
    );
  }, [auth, broadcast, cancelBroadcast, refetch]);

  if (isLoading && !data) {
    return (
      <View
        className="flex-1 items-center justify-center"
        style={{ marginTop: topInset }}
      >
        <ActivityIndicator />
      </View>
    );
  }

  if ((isError || !broadcast) && !data) {
    return (
      <ErrorScreen
        title="Не удалось загрузить рассылку"
        isLoading={isFetching}
        onRetry={refetch}
      />
    );
  }

  if (!broadcast) return null;

  const badge = getBroadcastBadge(broadcast);
  const stopReasonLabel = getStopReasonLabel(broadcast.stop_reason);
  const { sent_count, delivered_count, read_count, failed_count } =
    broadcast.stats;
  const deliverability = pct(delivered_count, sent_count);

  return (
    <>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: topInset,
          paddingBottom: bottomInset + 120,
        }}
        className="px-screen"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="flex-row items-center gap-2 mb-3">
          {badge && (
            <Badge size="sm" title={badge.title} variant={badge.variant} />
          )}
        </View>

        <Typography weight="semibold" className="text-xl mb-2">
          {broadcast.name}
        </Typography>
        <Typography
          weight="regular"
          className="text-body text-neutral-500 mb-5"
        >
          {broadcast.body}
        </Typography>

        {stopReasonLabel && (
          <View className="bg-accent-yellow-100 rounded-base p-4 mb-5">
            <Typography className="text-body text-neutral-900">
              {stopReasonLabel}
            </Typography>
          </View>
        )}

        <View className="flex-row gap-2 mb-2">
          <StatTile
            label="Отправлено"
            value={String(sent_count)}
            color="text-primary-blue-500"
          />
          <StatTile
            label="Доставлено"
            value={String(delivered_count)}
            color="text-primary-green-600"
          />
        </View>
        <View className="flex-row gap-2">
          <StatTile
            label="Прочитано"
            value={String(read_count)}
            color="text-purple-500"
          />
          <StatTile
            label="Не доставлено"
            value={String(failed_count)}
            color="text-accent-red-500"
          />
        </View>

        {sent_count > 0 && (
          <Typography className="text-caption text-neutral-500 mt-3">
            Доставляемость: {deliverability}%
          </Typography>
        )}
      </ScrollView>

      {isBroadcastCancellable(broadcast.status) && (
        <FloatingFooter offset={bottomInset + 8}>
          <Button
            title="Остановить неотправленное"
            variant="clear"
            textClassName="text-accent-red-500"
            disabled={isCancelling}
            onPress={handleCancel}
          />
        </FloatingFooter>
      )}
    </>
  );
};

const BroadcastDetail = ({ broadcastId }: { broadcastId: number }) => (
  <ScreenWithToolbar title="Рассылка">
    {({ topInset, bottomInset }) => (
      <BroadcastDetailContent
        broadcastId={broadcastId}
        topInset={topInset}
        bottomInset={bottomInset}
      />
    )}
  </ScreenWithToolbar>
);

export default BroadcastDetail;
