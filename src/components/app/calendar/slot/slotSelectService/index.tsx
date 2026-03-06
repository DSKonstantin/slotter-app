import React, { useCallback } from "react";
import {
  ActivityIndicator,
  SectionList,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ScreenWithToolbar from "@/src/components/shared/layout/screenWithToolbar";
import { SegmentedControl, StSvg, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import { TAB_BAR_HEIGHT } from "@/src/constants/tabs";
import { Routers } from "@/src/constants/routers";
import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";
import { useGetServiceCategoriesInfiniteQuery } from "@/src/store/redux/services/api/servicesApi";
import { skipToken } from "@reduxjs/toolkit/query";
import type { Service } from "@/src/store/redux/services/api-types";
import { formatRublesWithSymbol } from "@/src/utils/price/formatPrice";

const VIEW_OPTIONS = [
  { label: "Индивидуальная", value: "individual" },
  { label: "Групповая", value: "group" },
];

type ServiceRowProps = {
  service: Service;
  onPress: (service: Service) => void;
};

const ServiceRow: React.FC<ServiceRowProps> = ({ service, onPress }) => (
  <TouchableOpacity
    activeOpacity={0.7}
    onPress={() => onPress(service)}
    className="flex-row items-center justify-between px-screen py-4 border-b border-neutral-100"
  >
    <View className="flex-1 mr-4">
      <Typography weight="medium" className="text-body">
        {service.name}
      </Typography>
      <Typography className="text-caption text-neutral-500 mt-0.5">
        {service.duration} мин |{" "}
        {formatRublesWithSymbol(service.price_cents / 100)}
      </Typography>
    </View>
    <StSvg name="Expand_right" size={20} color={colors.neutral[400]} />
  </TouchableOpacity>
);

interface Props {
  date?: string;
  time?: string;
}

const SlotSelectService: React.FC<Props> = ({ date, time }) => {
  const { bottom } = useSafeAreaInsets();
  const auth = useRequiredAuth();

  const { data, isLoading } = useGetServiceCategoriesInfiniteQuery(
    auth
      ? { userId: auth.userId, params: { view: "with_services" } }
      : skipToken,
  );

  const categories =
    data?.pages.flatMap((page) => page.service_categories) ?? [];

  const handleSelectService = useCallback(
    (service: Service) => {
      router.push(
        Routers.app.calendar.slotCreate({
          date,
          time,
          serviceId: String(service.id),
          serviceName: service.name,
        }),
      );
    },
    [date, time],
  );

  if (!auth) return null;

  return (
    <ScreenWithToolbar title="Создать слот">
      {({ topInset }) => (
        <View className="flex-1" style={{ marginTop: topInset }}>
          <View className="px-screen mb-4">
            <SegmentedControl
              options={VIEW_OPTIONS}
              value="individual"
              onChange={() => {}}
            />
          </View>

          {isLoading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator color={colors.neutral[400]} />
            </View>
          ) : (
            <SectionList
              sections={categories
                .map((cat) => ({
                  title: cat.name,
                  data: (cat.services ?? []).filter((s) => s.is_active),
                }))
                .filter((section) => section.data.length > 0)}
              keyExtractor={(item) => String(item.id)}
              renderSectionHeader={({ section: { title } }) => (
                <View className="px-screen py-2 bg-background">
                  <Typography
                    weight="semibold"
                    className="text-caption text-neutral-500 uppercase"
                  >
                    {title}
                  </Typography>
                </View>
              )}
              renderItem={({ item }) => (
                <ServiceRow service={item} onPress={handleSelectService} />
              )}
              contentContainerStyle={{
                paddingBottom: TAB_BAR_HEIGHT + bottom + 24,
              }}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      )}
    </ScreenWithToolbar>
  );
};

export default SlotSelectService;
