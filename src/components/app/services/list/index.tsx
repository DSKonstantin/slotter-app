import React, { memo, useCallback, useMemo, useState } from "react";
import { ScrollView, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { NestableScrollContainer } from "react-native-draggable-flatlist";
import { skipToken } from "@reduxjs/toolkit/query";
import {
  Button,
  IconButton,
  StModal,
  StSvg,
  Typography,
} from "@/src/components/ui";
import { Image } from "expo-image";
import { colors } from "@/src/styles/colors";
import { Routers } from "@/src/constants/routers";
import { SCREEN_PADDING } from "@/src/constants/layout";
import ScreenWithToolbar from "@/src/components/shared/layout/screenWithToolbar";
import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";
import AdditionalList from "@/src/components/app/services/list/additionalList";
import { AdditionalListItem } from "@/src/components/app/services/list/additionalList/additionalServiceItem";
import { useAppDispatch, useAppSelector } from "@/src/store/redux/store";
import { useGetAdditionalServicesInfiniteQuery } from "@/src/store/redux/services/api/additionalServicesApi";
import { useGetServiceCategoriesInfiniteQuery } from "@/src/store/redux/services/api/serviceCategoriesApi";
import {
  resetEditMode,
  toggleEditMode,
} from "@/src/store/redux/slices/servicesSlice";
import ServiceList from "@/src/components/app/services/list/serviceList";
import {
  ServiceListSkeleton,
  AdditionalListSkeleton,
  ServicesButtonsRowSkeleton,
} from "./listSkeletons";

function ServicesToolbarActionsComponent() {
  const isEditMode = useAppSelector((s) => s.services.isEditMode);
  const dispatch = useAppDispatch();

  const handleEditPress = useCallback(() => {
    dispatch(toggleEditMode());
  }, [dispatch]);

  return (
    <View className="items-end w-[48px] h-[48px]">
      <IconButton
        size="md"
        onPress={handleEditPress}
        accessibilityLabel={isEditMode ? "Exit edit mode" : "Enter edit mode"}
        icon={
          <StSvg
            name={isEditMode ? "Close_round" : "Edit"}
            size={24}
            color={colors.neutral[900]}
          />
        }
      />
    </View>
  );
}

const ServicesToolbarActions = memo(ServicesToolbarActionsComponent);

const AppServices = () => {
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const auth = useRequiredAuth();
  const dispatch = useAppDispatch();

  const {
    data: categoriesData,
    isLoading: isCategoriesLoading,
    isError: isCategoriesError,
    isFetching: isCategoriesFetching,
    refetch: refetchServiceCategories,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGetServiceCategoriesInfiniteQuery(
    auth
      ? { userId: auth.userId, params: { view: "public_profile" } }
      : skipToken,
  );

  const {
    data: additionalData,
    isLoading: isAdditionalLoading,
    isError: isAdditionalError,
    isFetching: isAdditionalFetching,
    refetch: refetchAdditionalServices,
    fetchNextPage: fetchAdditionalNextPage,
    hasNextPage: hasAdditionalNextPage,
    isFetchingNextPage: isAdditionalFetchingNextPage,
  } = useGetAdditionalServicesInfiniteQuery(
    auth ? { userId: auth.userId } : skipToken,
  );

  const categories = useMemo(
    () =>
      categoriesData?.pages.flatMap((page) => page.service_categories) ?? [],
    [categoriesData],
  );

  const additionalServices = useMemo<AdditionalListItem[]>(() => {
    if (!additionalData?.pages) return [];

    const unique = new Map<number, AdditionalListItem>();

    additionalData.pages.forEach((page) => {
      page.additional_services.forEach((service) => {
        unique.set(service.id, service);
      });
    });

    return [...unique.values()];
  }, [additionalData?.pages]);

  const createServiceLink = useCallback(() => {
    setCreateModalVisible(false);
    router.push(Routers.app.services.create());
  }, []);

  const createAdditionalServiceLink = useCallback(() => {
    setCreateModalVisible(false);
    router.push(Routers.app.services.additionalServices.create);
  }, []);

  const createCategories = useCallback(() => {
    router.push(Routers.app.services.categories);
  }, []);

  const createService = useCallback(() => {
    setCreateModalVisible(true);
  }, []);

  const handleCategoriesRefresh = useCallback(() => {
    refetchServiceCategories({ refetchCachedPages: false });
  }, [refetchServiceCategories]);

  const handleAdditionalRefresh = useCallback(() => {
    if (isAdditionalFetchingNextPage) return;
    refetchAdditionalServices({ refetchCachedPages: false });
  }, [isAdditionalFetchingNextPage, refetchAdditionalServices]);

  const handleAdditionalLoadMore = useCallback(() => {
    if (!hasAdditionalNextPage || isAdditionalFetchingNextPage) return;
    fetchAdditionalNextPage();
  }, [
    fetchAdditionalNextPage,
    hasAdditionalNextPage,
    isAdditionalFetchingNextPage,
  ]);

  useFocusEffect(
    useCallback(() => {
      refetchServiceCategories({ refetchCachedPages: false });
      refetchAdditionalServices({ refetchCachedPages: false });
      return () => {
        dispatch(resetEditMode());
      };
    }, [dispatch, refetchServiceCategories, refetchAdditionalServices]),
  );

  if (!auth) {
    return null;
  }

  return (
    <>
      <ScreenWithToolbar
        title="Услуги"
        showBack={false}
        rightButton={
          categories.length > 1 ? <ServicesToolbarActions /> : undefined
        }
      >
        {({ topInset, bottomInset }) => {
          if (isCategoriesLoading || isAdditionalLoading) {
            return (
              <>
                <View style={{ marginTop: topInset }}>
                  <ServicesButtonsRowSkeleton />
                </View>
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{
                    gap: 24,
                    paddingHorizontal: SCREEN_PADDING,
                    paddingBottom: bottomInset + 8,
                  }}
                >
                  <ServiceListSkeleton />
                  <AdditionalListSkeleton />
                </ScrollView>
              </>
            );
          }

          return categories.length === 0 &&
            !isCategoriesLoading &&
            !isCategoriesError ? (
            <View
              className="flex-1 items-center justify-center gap-5 px-screen"
              style={{
                marginBottom: bottomInset + 8,
              }}
            >
              <Image
                style={{ width: 159, height: 142 }}
                source={require("@/assets/images/app/root-box.png")}
              />
              <View className="gap-2">
                <Typography
                  weight="semibold"
                  className="text-display text-center"
                >
                  Нет услуг
                </Typography>
                <Typography className="text-body text-neutral-500 text-center">
                  Добавь первую услугу — клиенты  смогут записаться
                </Typography>
              </View>

              <Button
                buttonClassName="w-full"
                title="Добавить услугу"
                variant="accent"
                onPress={() => {
                  router.push(Routers.app.services.create());
                }}
                rightIcon={
                  <StSvg
                    name="Add_round_fill"
                    size={24}
                    color={colors.neutral[0]}
                  />
                }
              />
            </View>
          ) : (
            <>
              <View
                className="flex-row gap-2.5 px-screen pb-4"
                style={{ marginTop: topInset }}
              >
                <Button
                  title="Создать услугу"
                  onPress={createService}
                  rightIcon={
                    <StSvg
                      name="Add_ring_fill"
                      size={24}
                      color={colors.neutral[0]}
                    />
                  }
                  buttonClassName="flex-1"
                />
                <Button
                  title="Категории"
                  variant="secondary"
                  textVariant="accent"
                  onPress={createCategories}
                  buttonClassName="flex-1"
                  rightIcon={
                    <StSvg
                      name="File_dock_search_fill"
                      size={24}
                      color={colors.primary.blue[500]}
                    />
                  }
                />
              </View>
              <NestableScrollContainer
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                  gap: 24,
                  paddingHorizontal: SCREEN_PADDING,
                  paddingBottom: bottomInset + 8,
                }}
              >
                <ServiceList
                  categories={categories}
                  isLoading={isCategoriesLoading}
                  isError={isCategoriesError}
                  isFetching={isCategoriesFetching}
                  hasNextPage={hasNextPage}
                  isFetchingNextPage={isFetchingNextPage}
                  onRefresh={handleCategoriesRefresh}
                  onLoadMore={fetchNextPage}
                />
                <AdditionalList
                  services={additionalServices}
                  isLoading={isAdditionalLoading}
                  isError={isAdditionalError}
                  isFetching={isAdditionalFetching}
                  hasNextPage={hasAdditionalNextPage}
                  isFetchingNextPage={isAdditionalFetchingNextPage}
                  onRefresh={handleAdditionalRefresh}
                  onLoadMore={handleAdditionalLoadMore}
                />
              </NestableScrollContainer>
            </>
          );
        }}
      </ScreenWithToolbar>
      <StModal
        visible={createModalVisible}
        onClose={() => setCreateModalVisible(false)}
      >
        <View className="gap-2.5">
          <Button
            title="Создать услугу"
            variant="accent"
            onPress={createServiceLink}
          />

          <Button
            title="Создать доп. услугу"
            variant="secondary"
            onPress={createAdditionalServiceLink}
          />
        </View>
      </StModal>
    </>
  );
};

export default AppServices;
