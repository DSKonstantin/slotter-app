import React, { useCallback, useMemo } from "react";
import { ActivityIndicator, SectionList, View } from "react-native";
import { skipToken } from "@reduxjs/toolkit/query";
import { StModal } from "@/src/components/ui/StModal";
import { Card, StSvg, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import { formatRublesFromCents } from "@/src/utils/price/formatPrice";
import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";
import { useGetServiceCategoriesInfiniteQuery } from "@/src/store/redux/services/api/servicesApi";
import type { Service } from "@/src/store/redux/services/api-types";

type Props = {
  visible: boolean;
  onClose: () => void;
  onSelect: (service: Service) => void;
};

const AttachServiceSheet = ({ visible, onClose, onSelect }: Props) => {
  const auth = useRequiredAuth();

  const { data: categoriesData, isLoading } =
    useGetServiceCategoriesInfiniteQuery(
      auth
        ? { userId: auth.userId, params: { view: "public_profile" } }
        : skipToken,
    );

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

  const handleSelect = useCallback(
    (service: Service) => {
      onSelect(service);
      onClose();
    },
    [onSelect, onClose],
  );

  return (
    <StModal visible={visible} onClose={onClose}>
      <Typography weight="semibold" className="text-neutral-900 text-body mb-4">
        Прикрепить услугу
      </Typography>

      {isLoading ? (
        <View className="items-center py-6">
          <ActivityIndicator color={colors.neutral[400]} />
        </View>
      ) : sections.length === 0 ? (
        <View className="items-center py-6">
          <Typography className="text-neutral-400">
            Нет доступных услуг
          </Typography>
        </View>
      ) : (
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
                onPress={() => handleSelect(item)}
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
      )}
    </StModal>
  );
};

export default AttachServiceSheet;
