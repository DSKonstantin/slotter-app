import React, { useMemo } from "react";
import { ActivityIndicator, SectionList, View } from "react-native";
import { Card, StSvg, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import { formatRublesFromCents } from "@/src/utils/price/formatPrice";
import { useGetServiceCategoriesInfiniteQuery } from "@/src/store/redux/services/api/serviceCategoriesApi";
import type { Service } from "@/src/store/redux/services/api-types";

type Props = {
  userId: number;
  onSelect: (service: Service) => void;
};

const ServicePicker = ({ userId, onSelect }: Props) => {
  const { data: categoriesData, isLoading } =
    useGetServiceCategoriesInfiniteQuery({
      userId,
      params: { view: "public_profile" },
    });

  const sections = useMemo(
    () =>
      (categoriesData?.pages.flatMap((p) => p.service_categories) ?? [])
        .map((cat) => ({
          title: cat.name,
          data: (cat.services ?? []).filter((s) => s.is_active),
        }))
        .filter((s) => s.data.length > 0),
    [categoriesData],
  );

  if (isLoading) {
    return (
      <View className="items-center py-6">
        <ActivityIndicator color={colors.neutral[400]} />
      </View>
    );
  }
  if (sections.length === 0) {
    return (
      <View className="items-center py-6">
        <Typography className="text-neutral-400">
          Нет доступных услуг
        </Typography>
      </View>
    );
  }

  return (
    <SectionList
      sections={sections}
      keyExtractor={(item) => String(item.id)}
      scrollEnabled={false}
      renderSectionHeader={({ section: { title } }) => (
        <View className="py-1">
          <Typography className="text-caption text-neutral-400">
            {title}
          </Typography>
        </View>
      )}
      renderItem={({ item }) => (
        <View className="mb-2">
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
        </View>
      )}
    />
  );
};

export default ServicePicker;
