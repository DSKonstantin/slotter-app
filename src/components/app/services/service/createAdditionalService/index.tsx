import React, { useMemo, useState } from "react";
import {
  Button,
  Card,
  IconButton,
  StSvg,
  Typography,
} from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import { FlatList, View } from "react-native";
import ContentLoader, { Rect } from "react-content-loader/native";
import { useFieldArray, useFormContext } from "react-hook-form";
import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";
import { skipToken } from "@reduxjs/toolkit/query";
import { useGetAdditionalServicesInfiniteQuery } from "@/src/store/redux/services/api/additionalServicesApi";
import { router } from "expo-router";
import { Routers } from "@/src/constants/routers";
import { SCREEN_PADDING } from "@/src/constants/layout";
import EditAdditionalServiceModal from "@/src/components/app/services/service/createAdditionalService/editAdditionalServiceModal";
import RetryInline from "@/src/components/shared/retryInline";
import { formatRublesFromCents } from "@/src/utils/price/formatPrice";
import type { AdditionalService } from "@/src/store/redux/services/api-types";

type AdditionalServicesFieldValues = {
  additionalServices: {
    serviceId: number;
  }[];
};

const SKELETON_CARD_WIDTHS = [180, 220, 160, 200];
const SKELETON_CARD_HEIGHT = 64;

const AdditionalServicesSkeleton = () => (
  <View
    className="flex-row mb-2"
    style={{ paddingHorizontal: SCREEN_PADDING }}
    accessibilityLabel="Loading additional services"
    accessible
  >
    {SKELETON_CARD_WIDTHS.map((width, index) => (
      <View key={index} style={{ marginRight: 8 }}>
        <ContentLoader
          speed={1.2}
          width={width}
          height={SKELETON_CARD_HEIGHT}
          backgroundColor={colors.neutral[100]}
          foregroundColor="#F5F5FA"
        >
          <Rect
            x={0}
            y={0}
            rx={20}
            ry={20}
            width={width}
            height={SKELETON_CARD_HEIGHT}
          />
        </ContentLoader>
      </View>
    ))}
  </View>
);

const CreateAdditionalService = () => {
  const [editingService, setEditingService] =
    useState<AdditionalService | null>(null);
  const { control } = useFormContext<AdditionalServicesFieldValues>();
  const auth = useRequiredAuth();

  const { fields, append, remove } = useFieldArray<
    AdditionalServicesFieldValues,
    "additionalServices"
  >({
    control,
    name: "additionalServices",
  });

  const { data, isLoading, isError, refetch } =
    useGetAdditionalServicesInfiniteQuery(
      auth ? { userId: auth.userId } : skipToken,
    );

  const additionalServicesFromApi = useMemo(() => {
    return data?.pages.flatMap((page) => page.additional_services) ?? [];
  }, [data]);

  const handleToggle = (service: AdditionalService) => {
    const existingIndex = fields.findIndex(
      (item) => item.serviceId === service.id,
    );

    if (existingIndex !== -1) {
      remove(existingIndex);
      return;
    }

    append({
      serviceId: service.id,
    });
  };

  if (!auth) return null;

  return (
    <>
      <View className="flex-row justify-between items-center px-screen mt-5  mb-2">
        <Typography className="text-caption text-neutral-500">
          Дополнительные услуги
        </Typography>
        <Button
          title="Все"
          variant="clear"
          buttonClassName="h-[24px] p-0 rounded-none gap-0"
          textClassName="text-[13px] text-neutral-500"
          onPress={() => {
            router.push(Routers.app.services.additionalServices.root);
          }}
          rightIcon={
            <StSvg
              name="Expand_right_light"
              size={16}
              color={colors.neutral[500]}
            />
          }
        />
      </View>

      {isLoading ? (
        <AdditionalServicesSkeleton />
      ) : isError ? (
        <View className="px-screen mb-2">
          <RetryInline
            text="Не удалось загрузить доп. услуги"
            onRetry={refetch}
          />
        </View>
      ) : (
        <FlatList
          className="mb-2"
          horizontal
          data={additionalServicesFromApi}
          keyExtractor={(service) => String(service.id)}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: SCREEN_PADDING,
            gap: 8,
          }}
          renderItem={({ item: service }) => {
            const selectedIndex = fields.findIndex(
              (item) => item.serviceId === service.id,
            );
            const isSelected = selectedIndex !== -1;

            return (
              <View className="relative py-2">
                <Card
                  title={service.name}
                  subtitle={`${service.duration} мин | ${formatRublesFromCents(service.price_cents)}`}
                  onPress={() => handleToggle(service)}
                  pressArea="content"
                  active={isSelected}
                  right={
                    <IconButton
                      size="xs"
                      hitSlop={{ top: 16, bottom: 16, left: 8, right: 16 }}
                      onPress={() => setEditingService(service)}
                      icon={
                        <StSvg
                          name="Edit_light"
                          size={24}
                          color={colors.neutral[500]}
                        />
                      }
                    />
                  }
                />

                {isSelected && (
                  <IconButton
                    onPress={() => remove(selectedIndex)}
                    size="xs"
                    buttonClassName="absolute top-0 right-0 bg-background rounded-full"
                    icon={
                      <StSvg
                        name="Close_round_fill_light"
                        size={18}
                        color={colors.neutral[900]}
                      />
                    }
                  />
                )}
              </View>
            );
          }}
        />
      )}

      <EditAdditionalServiceModal
        visible={!!editingService}
        service={editingService}
        onClose={() => setEditingService(null)}
      />
    </>
  );
};

export default CreateAdditionalService;
