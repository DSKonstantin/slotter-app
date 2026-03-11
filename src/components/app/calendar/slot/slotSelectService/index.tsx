import React, { useCallback, useState } from "react";
import { ActivityIndicator, SectionList, View } from "react-native";
import { router } from "expo-router";
import ScreenWithToolbar from "@/src/components/shared/layout/screenWithToolbar";
import {
  Card,
  SegmentedControl,
  StSvg,
  Typography,
  Button,
} from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import { Routers } from "@/src/constants/routers";

import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";
import { useAppSelector } from "@/src/store/redux/store";
import BookingLinkModal from "@/src/components/app/calendar/slot/bookingLinkModal";
import { useGetServiceCategoriesInfiniteQuery } from "@/src/store/redux/services/api/servicesApi";
import { skipToken } from "@reduxjs/toolkit/query";
import type { Service } from "@/src/store/redux/services/api-types";
import { formatRublesFromCents } from "@/src/utils/price/formatPrice";

const VIEW_OPTIONS = [
  { label: "Индивидуальная", value: "individual" },
  { label: "Групповая", value: "group" },
];

type ServiceRowProps = {
  service: Service;
  onPress: (service: Service) => void;
};

const ServiceRow: React.FC<ServiceRowProps> = ({ service, onPress }) => (
  <Card
    title={service.name}
    subtitle={`${service.duration} мин | ${formatRublesFromCents(service.price_cents)}`}
    onPress={() => onPress(service)}
    right={
      <StSvg name="Expand_right_light" size={24} color={colors.neutral[500]} />
    }
  />
);

interface Props {
  date?: string;
  time?: string;
}

const SlotSelectService: React.FC<Props> = ({ date, time }) => {
  const auth = useRequiredAuth();
  const personalLink = useAppSelector((s) => s.auth.user?.personal_link);
  const [bookingLinkVisible, setBookingLinkVisible] = useState(false);

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
          duration: String(service.duration),
        }),
      );
    },
    [date, time],
  );

  if (!auth) return null;

  return (
    <>
      <ScreenWithToolbar title="Выберите услугу">
        {({ topInset, bottomInset }) => (
          <View
            className="flex-1 px-screen"
            style={{ marginTop: topInset, marginBottom: bottomInset + 16 }}
          >
            <View className="mb-4">
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
              <>
                <SectionList
                  sections={categories
                    .map((cat) => ({
                      title: cat.name,
                      data: cat.services ?? [],
                    }))
                    .filter((section) => section.data.length > 0)}
                  keyExtractor={(item) => String(item.id)}
                  renderSectionHeader={({ section: { title } }) => (
                    <View className="py-2 bg-background">
                      <Typography
                        weight="semibold"
                        className="text-caption text-neutral-500 uppercase"
                      >
                        {title}
                      </Typography>
                    </View>
                  )}
                  renderItem={({ item }) => (
                    <View className="mb-2">
                      <ServiceRow
                        service={item}
                        onPress={handleSelectService}
                      />
                    </View>
                  )}
                  contentContainerStyle={{
                    paddingBottom: 24,
                  }}
                  showsVerticalScrollIndicator={false}
                />

                <View className="gap-2">
                  <Button
                    title="Отправить ссылку на бронирование"
                    variant="clear"
                    rightIcon={
                      <StSvg
                        name="link_alt"
                        size={24}
                        color={colors.neutral[900]}
                      />
                    }
                    onPress={() => setBookingLinkVisible(true)}
                  />
                  <Button title="Далее" onPress={() => {}} />
                </View>
              </>
            )}
          </View>
        )}
      </ScreenWithToolbar>

      <BookingLinkModal
        visible={bookingLinkVisible}
        bookingUrl={personalLink ?? ""}
        onClose={() => setBookingLinkVisible(false)}
      />
    </>
  );
};

export default SlotSelectService;
