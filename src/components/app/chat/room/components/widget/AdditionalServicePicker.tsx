import React, { useEffect, useMemo } from "react";
import { ActivityIndicator, FlatList, View } from "react-native";
import { Button, Card, StSvg, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import { formatRublesFromCents } from "@/src/utils/price/formatPrice";
import { useGetAdditionalServicesInfiniteQuery } from "@/src/store/redux/services/api/additionalServicesApi";
import RetryInline from "@/src/components/shared/retryInline";
import type { AdditionalService } from "@/src/store/redux/services/api-types";

type Props = {
  userId: number;
  onSelect: (service: AdditionalService) => void;
  onSkip?: () => void;
};

const AdditionalServicePicker = ({ userId, onSelect, onSkip }: Props) => {
  const {
    data,
    isLoading,
    isError,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    refetch,
  } = useGetAdditionalServicesInfiniteQuery({ userId });

  const items = useMemo(
    () =>
      (data?.pages.flatMap((p) => p.additional_services) ?? []).filter(
        (s) => s.is_active,
      ),
    [data],
  );

  useEffect(() => {
    if (!isLoading && !isError && items.length === 0) {
      onSkip?.();
    }
  }, [isLoading, isError, items.length, onSkip]);

  if (isLoading) {
    return (
      <View className="items-center py-6">
        <ActivityIndicator color={colors.neutral[400]} />
      </View>
    );
  }
  if (isError && !data) {
    return (
      <View className="py-6">
        <RetryInline
          text="Не удалось загрузить доп. услуги"
          onRetry={refetch}
          layout="column"
        />
      </View>
    );
  }
  if (items.length === 0) {
    return (
      <View className="items-center py-6">
        <Typography className="text-neutral-400">Нет доп. услуг</Typography>
      </View>
    );
  }

  return (
    <View>
      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id)}
        scrollEnabled={false}
        ItemSeparatorComponent={() => <View className="h-2" />}
        ListFooterComponent={
          hasNextPage ? (
            <Button
              title="Показать ещё"
              loading={isFetchingNextPage}
              disabled={isFetchingNextPage}
              onPress={() => fetchNextPage()}
              buttonClassName="mt-2"
            />
          ) : null
        }
        renderItem={({ item }) => (
          <Card
            title={item.name}
            subtitle={`${item.duration} мин · ${formatRublesFromCents(item.price_cents)}`}
            onPress={() => onSelect(item)}
            right={
              <StSvg
                name="Expand_right_light"
                size={24}
                color={colors.neutral[500]}
              />
            }
          />
        )}
      />
    </View>
  );
};

export default AdditionalServicePicker;
