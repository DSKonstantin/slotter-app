import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { FlatList, Pressable, View } from "react-native";
import { skipToken } from "@reduxjs/toolkit/query";
import { Button, StSvg, Typography } from "@/src/components/ui";
import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";
import { useGetServiceCategoriesInfiniteQuery } from "@/src/store/redux/services/api/servicesApi";
import { colors } from "@/src/styles/colors";
import type { Service } from "@/src/store/redux/services/api-types";
import PreviewServiceCard from "@/src/components/app/menu/account/preview/services/PreviewServiceCard";
import ServicesSkeleton from "@/src/components/app/menu/account/preview/services/ServicesSkeleton";

type ServiceItem = { serviceId: number; service: Service };

const Services = () => {
  const auth = useRequiredAuth();
  const listRef = useRef<FlatList<ServiceItem>>(null);

  const {
    data,
    isLoading,
    isError,
    isFetching,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    refetch,
  } = useGetServiceCategoriesInfiniteQuery(
    auth
      ? {
          userId: auth.userId,
          params: { view: "public_profile" },
        }
      : skipToken,
  );

  const services = useMemo<ServiceItem[]>(() => {
    return (data?.pages.flatMap((page) => page.service_categories) ?? [])
      .filter((category) => category.is_active)
      .flatMap((category) =>
        (category.services ?? [])
          .filter((service) => service.is_active)
          .map((service) => ({ serviceId: service.id, service })),
      );
  }, [data]);

  const handleRetry = useCallback(() => {
    refetch({ refetchCachedPages: false });
  }, [refetch]);

  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage || isError) return;
    fetchNextPage();
  }, [fetchNextPage, hasNextPage, isError, isFetchingNextPage]);

  if (!auth) return null;

  if (isLoading && !data) {
    return <ServicesSkeleton />;
  }

  if (isError && !data) {
    return (
      <View className="gap-3 mx-screen">
        <Typography weight="semibold" className="text-[20px] text-neutral-900">
          Услуги
        </Typography>
        <View
          style={{ width: 187 }}
          className="items-center gap-3 rounded-[28px] bg-background-surface p-8"
        >
          <StSvg name="Sad_alt_2" size={40} color={colors.neutral[300]} />
          <Typography className="text-center text-body text-neutral-500">
            Не удалось загрузить услуги
          </Typography>
          <Button
            title="Повторить"
            variant="secondary"
            onPress={handleRetry}
            loading={isFetching}
          />
        </View>
      </View>
    );
  }

  if (!services.length) return null;

  return (
    <View className="gap-2">
      <View className="flex-1 gap-1 flex-row justify-between mx-screen">
        <Typography weight="semibold" className="text-body text-neutral-900">
          Услуги
        </Typography>

        <Pressable
          onPress={() => {}}
          className="flex-row items-center active:opacity-70"
        >
          <Typography className="text-body text-neutral-500">Все</Typography>
          <StSvg
            name="Expand_right_light"
            size={20}
            color={colors.neutral[500]}
          />
        </Pressable>
      </View>

      <FlatList
        ref={listRef}
        data={services}
        horizontal
        className="pl-screen"
        contentContainerStyle={{
          paddingRight: 20,
        }}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => String(item.serviceId)}
        decelerationRate="fast"
        snapToAlignment="start"
        disableIntervalMomentum
        ItemSeparatorComponent={() => <View className="w-4" />}
        renderItem={({ item }) => <PreviewServiceCard service={item.service} />}
      />
    </View>
  );
};

export default Services;
