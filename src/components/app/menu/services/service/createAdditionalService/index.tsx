import React, { useMemo, useState } from "react";
import {
  Button,
  Card,
  IconButton,
  StSvg,
  Typography,
} from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import { ScrollView, View } from "react-native";
import { useFieldArray, useFormContext } from "react-hook-form";
import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";
import { skipToken } from "@reduxjs/toolkit/query";
import { useGetAdditionalServicesInfiniteQuery } from "@/src/store/redux/services/api/servicesApi";
import map from "lodash/map";
import { router } from "expo-router";
import { Routers } from "@/src/constants/routers";
import EditAdditionalServiceModal from "@/src/components/app/menu/services/service/createAdditionalService/editAdditionalServiceModal";
import { formatRublesFromCents } from "@/src/utils/price/formatPrice";
import type { AdditionalService } from "@/src/store/redux/services/api-types";

type AdditionalServicesFieldValues = {
  additionalServices: {
    serviceId: number;
  }[];
};

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

  const { data } = useGetAdditionalServicesInfiniteQuery(
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
      <View className="flex-row justify-between items-center px-screen mt-5 mb-2">
        <Typography className="text-caption text-neutral-500">
          Дополнительные услуги
        </Typography>
        <Button
          title="Все"
          variant="clear"
          buttonClassName="h-[24px] p-0 rounded-none gap-0"
          textClassName="text-[13px] text-neutral-500"
          onPress={() => {
            router.push(Routers.app.menu.services.additionalServices.root);
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

      <ScrollView
        className="mb-2"
        horizontal
        contentContainerStyle={{
          paddingHorizontal: 20,
        }}
        showsHorizontalScrollIndicator={false}
      >
        <View className="flex-row gap-2 py-2">
          {map(additionalServicesFromApi, (service) => {
            const selectedIndex = fields.findIndex(
              (item) => item.serviceId === service.id,
            );

            const isSelected = selectedIndex !== -1;

            return (
              <View key={service.id} className="relative">
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
                    buttonClassName="absolute -top-2 -right-2 bg-background rounded-full"
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
          })}
        </View>
      </ScrollView>

      <EditAdditionalServiceModal
        visible={!!editingService}
        service={editingService}
        onClose={() => setEditingService(null)}
      />
    </>
  );
};

export default CreateAdditionalService;
