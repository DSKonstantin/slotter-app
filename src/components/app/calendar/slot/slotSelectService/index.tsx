import React, { useCallback, useMemo, useState } from "react";

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
import { useAppDispatch, useAppSelector } from "@/src/store/redux/store";
import { setSlotDraft } from "@/src/store/redux/slices/slotDraftSlice";
import BookingLinkModal from "@/src/components/app/calendar/slot/bookingLinkModal";
import { useGetServiceCategoriesInfiniteQuery } from "@/src/store/redux/services/api/serviceCategoriesApi";
import { useGetAdditionalServicesInfiniteQuery } from "@/src/store/redux/services/api/additionalServicesApi";
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

type Mode = "services" | "additional";

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
  selectedAdditionalServiceIds?: string;
  mode?: Mode;
}

type SectionType = "category" | "additional";
type SectionItem = Service | AdditionalService;
type Section = {
  title: string;
  type: SectionType;
  data: SectionItem[];
};

const SlotSelectService: React.FC<Props> = ({
  date,
  time,
  appointmentId,
  selectedServiceIds,
  selectedAdditionalServiceIds,
  mode,
}) => {
  const auth = useRequiredAuth();
  const dispatch = useAppDispatch();
  const personalLink = useAppSelector((s) => s.auth.user?.nickname);
  const [bookingLinkVisible, setBookingLinkVisible] = useState(false);
  const [groupModalVisible, setGroupModalVisible] = useState(false);
  const [updateAppointment, { isLoading: isUpdating }] =
    useUpdateAppointmentMutation();

  const showServices = mode !== "additional";
  const showAdditional = mode !== "services";

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useGetServiceCategoriesInfiniteQuery(
      auth && showServices
        ? { userId: auth.userId, params: { view: "public_profile" } }
        : skipToken,
    );

  const {
    data: additionalData,
    fetchNextPage: fetchAdditionalNextPage,
    hasNextPage: hasAdditionalNextPage,
    isFetchingNextPage: isAdditionalFetchingNextPage,
  } = useGetAdditionalServicesInfiniteQuery(
    auth && showAdditional ? { userId: auth.userId, params: {} } : skipToken,
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

  const sections = useMemo<Section[]>(() => {
    const result: Section[] = [];

    if (showServices) {
      categories
        .map<Section>((cat) => ({
          title: cat.name,
          type: "category",
          data: (cat.services ?? []) as SectionItem[],
        }))
        .filter((section) => section.data.length > 0)
        .forEach((section) => result.push(section));
    }

    if (showAdditional && additionalServices.length > 0) {
      result.push({
        title: "Дополнительные услуги",
        type: "additional",
        data: additionalServices as SectionItem[],
      });
    }

    return result;
  }, [categories, additionalServices, showServices, showAdditional]);

  const allServices = useMemo(
    () => categories.flatMap((cat) => cat.services ?? []),
    [categories],
  );

  const [selectedServiceIdSet, setSelectedServiceIdSet] = useState<Set<number>>(
    () =>
      new Set(
        selectedServiceIds ? selectedServiceIds.split(",").map(Number) : [],
      ),
  );
  const [selectedAdditionalIdSet, setSelectedAdditionalIdSet] = useState<
    Set<number>
  >(
    () =>
      new Set(
        selectedAdditionalServiceIds
          ? selectedAdditionalServiceIds.split(",").map(Number)
          : [],
      ),
  );

  const selectedServices = useMemo(
    () => allServices.filter((s) => selectedServiceIdSet.has(s.id)),
    [allServices, selectedServiceIdSet],
  );

  const selectedAdditional = useMemo(
    () => additionalServices.filter((s) => selectedAdditionalIdSet.has(s.id)),
    [additionalServices, selectedAdditionalIdSet],
  );

  const handleToggleService = useCallback((service: Service) => {
    setSelectedServiceIdSet((prev) => {
      const next = new Set(prev);
      if (next.has(service.id)) {
        next.delete(service.id);
      } else {
        if (next.size >= 5) return prev;
        next.add(service.id);
      }
      return next;
    });
  }, []);

  const handleToggleAdditional = useCallback((service: AdditionalService) => {
    setSelectedAdditionalIdSet((prev) => {
      const next = new Set(prev);
      if (next.has(service.id)) {
        next.delete(service.id);
      } else {
        if (next.size >= 10) return prev;
        next.add(service.id);
      }
      return next;
    });
  }, []);

  const handleCreateService = useCallback(() => {
    router.push(Routers.app.menu.services.create());
  }, []);

  const handleNext = useCallback(async () => {
    if (mode !== "additional" && selectedServices.length === 0) return;

    if (appointmentId) {
      try {
        const body =
          mode === "services"
            ? { service_ids: selectedServices.map((s) => s.id) }
            : mode === "additional"
              ? {
                  additional_service_ids: selectedAdditional.map((s) => s.id),
                }
              : {
                  service_ids: selectedServices.map((s) => s.id),
                  additional_service_ids: selectedAdditional.map((s) => s.id),
                };

        await updateAppointment({
          id: Number(appointmentId),
          body,
        }).unwrap();
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
    mode,
    selectedServices,
    selectedAdditional,
    appointmentId,
    dispatch,
    date,
    time,
    updateAppointment,
  ]);

  if (!auth) return null;

  const screenTitle =
    mode === "additional" ? "Выберите доп. услугу" : "Выберите услугу";

  const isPrimarySelectionEmpty =
    mode === "additional" ? false : selectedServices.length === 0;

  const nextButtonTitle = (() => {
    if (mode === "additional") {
      return selectedAdditional.length === 0
        ? "Сохранить"
        : `Сохранить (${selectedAdditional.length} доп)`;
    }
    if (mode === "services") {
      return selectedServices.length === 0
        ? "Далее"
        : `Далее (${selectedServices.length})`;
    }
    if (selectedServices.length === 0) return "Далее";
    if (appointmentId || selectedAdditional.length === 0) {
      return `Далее (${selectedServices.length})`;
    }
    return `Далее (${selectedServices.length} + ${selectedAdditional.length} доп)`;
  })();

  const showEmptyState =
    mode === "additional"
      ? !isLoading && additionalServices.length === 0 && !showServices
      : !isLoading && allServices.length === 0;

  return (
    <>
      <ScreenWithToolbar title={screenTitle}>
        {({ topInset, bottomInset }) => (
          <View
            className="flex-1 px-screen"
            style={{ marginTop: topInset, marginBottom: bottomInset + 16 }}
          >
            {!mode && (
              <SegmentedControl
                options={VIEW_OPTIONS}
                value="individual"
                onChange={(value) => {
                  if (value === "group") setGroupModalVisible(true);
                }}
              />
            )}

            {showServices && selectedServices.length > 0 && (
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
            ) : showEmptyState ? (
              <View className="flex-1 items-center justify-center gap-4">
                <Typography className="text-body text-neutral-500 text-center">
                  {mode === "additional"
                    ? "У вас пока нет доп. услуг"
                    : "У вас пока нет услуг"}
                </Typography>
                {mode !== "additional" && (
                  <Button
                    title="Создать услугу"
                    onPress={handleCreateService}
                  />
                )}
              </View>
            ) : (
              <>
                <SectionList<SectionItem, Section>
                  sections={sections}
                  keyExtractor={(item) => String(item.id)}
                  stickySectionHeadersEnabled={false}
                  renderSectionHeader={() => null}
                  renderSectionFooter={({ section }) => {
                    const categorySections = sections.filter(
                      (s) => s.type === "category",
                    );
                    const isLastCategory =
                      section.type === "category" &&
                      section ===
                        categorySections[categorySections.length - 1];

                    if (isLastCategory && hasNextPage) {
                      return (
                        <Button
                          title="Показать ещё"
                          onPress={() => fetchNextPage()}
                          loading={isFetchingNextPage}
                          disabled={isFetchingNextPage}
                          buttonClassName="mt-2"
                        />
                      );
                    }
                    if (
                      section.type === "additional" &&
                      hasAdditionalNextPage
                    ) {
                      return (
                        <Button
                          title="Показать ещё"
                          onPress={() => fetchAdditionalNextPage()}
                          loading={isAdditionalFetchingNextPage}
                          disabled={isAdditionalFetchingNextPage}
                          buttonClassName="mt-2"
                        />
                      );
                    }
                    return null;
                  }}
                  renderItem={({ item, index, section }) => (
                    <View>
                      {index === 0 && (
                        <View
                          className={`py-2 ${section.type === "additional" ? "flex-row justify-between items-center mt-4" : ""}`}
                        >
                          <Typography
                            weight="semibold"
                            className="text-caption text-neutral-500 uppercase"
                          >
                            {section.title}
                          </Typography>
                          {section.type === "additional" &&
                            selectedAdditional.length > 0 && (
                              <Typography className="text-caption text-neutral-500">
                                {selectedAdditional.length} / 10 выбрано
                              </Typography>
                            )}
                        </View>
                      )}
                      <View className="mb-2">
                        {section.type === "category" ? (
                          <ServiceRow
                            service={item as Service}
                            isSelected={selectedServices.some(
                              (s) => s.id === item.id,
                            )}
                            onPress={handleToggleService}
                          />
                        ) : (
                          <Card
                            title={item.name}
                            subtitle={`${item.duration} мин | ${formatRublesFromCents(item.price_cents)}`}
                            active={selectedAdditional.some(
                              (s) => s.id === item.id,
                            )}
                            onPress={() =>
                              handleToggleAdditional(item as AdditionalService)
                            }
                            right={
                              selectedAdditional.some(
                                (s) => s.id === item.id,
                              ) ? (
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
                        )}
                      </View>
                    </View>
                  )}
                  contentContainerStyle={{ paddingBottom: 24 }}
                  showsVerticalScrollIndicator={false}
                />

                <View className="gap-2">
                  {!mode && (
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
                  )}
                  <Button
                    title={nextButtonTitle}
                    disabled={isPrimarySelectionEmpty}
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
