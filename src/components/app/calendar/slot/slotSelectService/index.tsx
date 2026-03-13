import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ActivityIndicator, SectionList, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
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
import { useAppDispatch, useAppSelector } from "@/src/store/redux/store";
import { setSlotDraft } from "@/src/store/redux/slices/slotDraftSlice";
import BookingLinkModal from "@/src/components/app/calendar/slot/bookingLinkModal";
import {
  useGetServiceCategoriesInfiniteQuery,
  useGetAdditionalServicesInfiniteQuery,
} from "@/src/store/redux/services/api/servicesApi";
import { useUpdateAppointmentMutation } from "@/src/store/redux/services/api/appointmentsApi";
import { skipToken } from "@reduxjs/toolkit/query";
import type {
  AdditionalService,
  Service,
} from "@/src/store/redux/services/api-types";
import { formatRublesFromCents } from "@/src/utils/price/formatPrice";
import { toast } from "@backpackapp-io/react-native-toast";
import { getApiErrorMessage } from "@/src/utils/apiError";
import ComingSoonModal from "@/src/components/shared/modals/ComingSoonModal";

const VIEW_OPTIONS = [
  { label: "Индивидуальная", value: "individual" },
  { label: "Групповая", disabled: true, value: "group" },
];

type ServiceRowProps = {
  service: Service;
  isSelected: boolean;
  onPress: (service: Service) => void;
};

const ServiceRow: React.FC<ServiceRowProps> = ({
  service,
  isSelected,
  onPress,
}) => (
  <Card
    title={service.name}
    subtitle={`${service.duration} мин | ${formatRublesFromCents(service.price_cents)}`}
    active={isSelected}
    onPress={() => onPress(service)}
    right={
      isSelected ? (
        <StSvg
          name="Check_round_fill"
          size={24}
          color={colors.primary.blue[500]}
        />
      ) : (
        <StSvg
          name="Expand_right_light"
          size={24}
          color={colors.neutral[500]}
        />
      )
    }
  />
);

interface Props {
  date?: string;
  time?: string;
  appointmentId?: string;
  selectedServiceIds?: string;
}

const SlotSelectService: React.FC<Props> = ({
  date,
  time,
  appointmentId,
  selectedServiceIds,
}) => {
  const initializedRef = useRef(false);
  const auth = useRequiredAuth();
  const dispatch = useAppDispatch();
  const personalLink = useAppSelector((s) => s.auth.user?.personal_link);
  const [bookingLinkVisible, setBookingLinkVisible] = useState(false);
  const [groupModalVisible, setGroupModalVisible] = useState(false);
  const [updateAppointment, { isLoading: isUpdating }] =
    useUpdateAppointmentMutation();

  const { data, isLoading } = useGetServiceCategoriesInfiniteQuery(
    auth
      ? { userId: auth.userId, params: { view: "with_services" } }
      : skipToken,
  );

  const { data: additionalData, isLoading: isLoadingAdditional } =
    useGetAdditionalServicesInfiniteQuery(
      auth ? { userId: auth.userId, params: {} } : skipToken,
    );

  const additionalServices = useMemo(
    () =>
      (
        additionalData?.pages.flatMap((p) => p.additional_services) ?? []
      ).filter((s) => s.is_active),
    [additionalData],
  );

  const categories = useMemo(
    () => data?.pages.flatMap((page) => page.service_categories) ?? [],
    [data],
  );

  const preselectedIds = useMemo(
    () => (selectedServiceIds ? selectedServiceIds.split(",").map(Number) : []),
    [selectedServiceIds],
  );

  const allServices = useMemo(
    () => categories.flatMap((cat) => cat.services ?? []),
    [categories],
  );

  const [selectedServices, setSelectedServices] = useState<Service[]>(() =>
    allServices.filter((s) => preselectedIds.includes(s.id)),
  );
  const [selectedAdditional, setSelectedAdditional] = useState<
    AdditionalService[]
  >([]);

  useFocusEffect(
    useCallback(() => {
      setSelectedServices([]);
      setSelectedAdditional([]);
    }, []),
  );

  const handleToggleService = useCallback((service: Service) => {
    setSelectedServices((prev) => {
      if (prev.some((s) => s.id === service.id)) {
        return prev.filter((s) => s.id !== service.id);
      }
      if (prev.length >= 5) return prev;
      return [...prev, service];
    });
  }, []);

  const handleToggleAdditional = useCallback((service: AdditionalService) => {
    setSelectedAdditional((prev) => {
      if (prev.some((s) => s.id === service.id)) {
        return prev.filter((s) => s.id !== service.id);
      }
      if (prev.length >= 10) return prev;
      return [...prev, service];
    });
  }, []);

  const handleNext = useCallback(async () => {
    if (selectedServices.length === 0) return;

    if (appointmentId) {
      try {
        await updateAppointment({
          id: Number(appointmentId),
          body: { service_ids: selectedServices.map((s) => s.id) },
        }).unwrap();
        toast.success("Услуги обновлены");
        router.back();
      } catch (error) {
        toast.error(getApiErrorMessage(error, "Не удалось обновить услуги"));
      }
      return;
    }

    dispatch(
      setSlotDraft({
        date,
        time,
        services: selectedServices,
        additionalServices: selectedAdditional,
      }),
    );
    router.push(Routers.app.calendar.slotCreate());
  }, [
    selectedServices,
    appointmentId,
    dispatch,
    date,
    time,
    selectedAdditional,
    updateAppointment,
  ]);

  useEffect(() => {
    if (
      !initializedRef.current &&
      allServices.length > 0 &&
      preselectedIds.length > 0
    ) {
      initializedRef.current = true;
      setSelectedServices(
        allServices.filter((s) => preselectedIds.includes(s.id)),
      );
    }
  }, [allServices, preselectedIds]);

  if (!auth) return null;

  return (
    <>
      <ScreenWithToolbar title="Выберите услугу">
        {({ topInset, bottomInset }) => (
          <View
            className="flex-1 px-screen"
            style={{ marginTop: topInset, marginBottom: bottomInset + 16 }}
          >
            <SegmentedControl
              options={VIEW_OPTIONS}
              value="individual"
              onChange={(value) => {
                if (value === "group") setGroupModalVisible(true);
              }}
            />

            {selectedServices.length > 0 && (
              <View className="flex-row justify-between items-center py-2">
                <Typography className="text-caption text-neutral-500">
                  Выбрано услуг
                </Typography>
                <Typography className="text-caption text-neutral-500">
                  {selectedServices.length} / 5
                </Typography>
              </View>
            )}

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
                        isSelected={selectedServices.some(
                          (s) => s.id === item.id,
                        )}
                        onPress={handleToggleService}
                      />
                    </View>
                  )}
                  contentContainerStyle={{ paddingBottom: 24 }}
                  showsVerticalScrollIndicator={false}
                  ListFooterComponent={
                    additionalServices.length > 0 ? (
                      <View className="mt-4">
                        <View className="flex-row justify-between items-center mb-2">
                          <Typography
                            weight="semibold"
                            className="text-caption text-neutral-500 uppercase"
                          >
                            Дополнительные услуги
                          </Typography>
                          {selectedAdditional.length > 0 && (
                            <Typography className="text-caption text-neutral-500">
                              {selectedAdditional.length} / 10 выбрано
                            </Typography>
                          )}
                        </View>
                        <View className="gap-2">
                          {isLoadingAdditional ? (
                            <ActivityIndicator color={colors.neutral[400]} />
                          ) : (
                            additionalServices.map((service) => {
                              const isSelected = selectedAdditional.some(
                                (s) => s.id === service.id,
                              );
                              return (
                                <Card
                                  key={service.id}
                                  title={service.name}
                                  subtitle={`${service.duration} мин | ${formatRublesFromCents(service.price_cents)}`}
                                  active={isSelected}
                                  onPress={() =>
                                    handleToggleAdditional(service)
                                  }
                                  right={
                                    isSelected ? (
                                      <StSvg
                                        name="Check_round_fill"
                                        size={24}
                                        color={colors.primary.blue[500]}
                                      />
                                    ) : (
                                      <StSvg
                                        name="Expand_right_light"
                                        size={24}
                                        color={colors.neutral[500]}
                                      />
                                    )
                                  }
                                />
                              );
                            })
                          )}
                        </View>
                      </View>
                    ) : null
                  }
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
                  <Button
                    title={
                      selectedServices.length === 0
                        ? "Далее"
                        : appointmentId || selectedAdditional.length === 0
                          ? `Далее (${selectedServices.length})`
                          : `Далее (${selectedServices.length} + ${selectedAdditional.length} доп)`
                    }
                    disabled={selectedServices.length === 0}
                    loading={isUpdating}
                    onPress={handleNext}
                  />
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

      <ComingSoonModal
        visible={groupModalVisible}
        onClose={() => setGroupModalVisible(false)}
      />
    </>
  );
};

export default SlotSelectService;
