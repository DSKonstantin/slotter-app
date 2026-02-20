import React, { useCallback } from "react";
import {
  Button,
  Card,
  IconButton,
  StSvg,
  Tag,
  Typography,
} from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import { View, Text, ScrollView } from "react-native";
import { TAB_BAR_HEIGHT, TOOLBAR_HEIGHT } from "@/src/constants/tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Routers } from "@/src/constants/routers";
import { useGetServiceCategoriesQuery } from "@/src/store/redux/services/api/servicesApi";
import { useSelector } from "react-redux";
import { RootState } from "@/src/store/redux/store";
import map from "lodash/map";
import ScreenWithToolbar from "@/src/components/shared/layout/screenWithToolbar";

const AppServices = () => {
  const { top } = useSafeAreaInsets();
  const user = useSelector((state: RootState) => state.auth.user);

  const {
    data: categories,
    isLoading,
    isError,
  } = useGetServiceCategoriesQuery(
    { userId: user?.id ?? 0, params: { view: "with_services" } },
    { skip: !user?.id },
  );

  const createService = useCallback(() => {
    router.push(Routers.app.menu.services.create());
  }, []);

  const createCategories = useCallback(() => {
    router.push(Routers.app.menu.services.categories);
  }, []);

  if (isLoading) {
    return (
      <View
        className="flex-1 items-center justify-center"
        style={{
          marginTop: TOOLBAR_HEIGHT + top,
        }}
      >
        <Text className="text-neutral-500">Загрузка категорий...</Text>
      </View>
    );
  }

  if (isError || !categories) {
    return (
      <View
        className="flex-1 items-center justify-center"
        style={{
          marginTop: TOOLBAR_HEIGHT + top,
        }}
      >
        <Text className="text-error">Ошибка загрузки категорий.</Text>
      </View>
    );
  }

  return (
    <ScreenWithToolbar
      title="Услуги"
      rightButton={
        <IconButton
          disabled={isLoading}
          onPress={() => {}}
          icon={<StSvg name="Search" size={24} color={colors.neutral[900]} />}
        />
      }
    >
      {({ topInset }) => (
        <>
          <View
            className="flex-row gap-2.5 px-screen pb-4"
            style={{
              marginTop: topInset,
            }}
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
          <ScrollView
            className="flex-1 px-screen"
            contentContainerStyle={{
              gap: 24,
              paddingBottom: TAB_BAR_HEIGHT + 60,
            }}
          >
            {map(categories.service_categories, (category) => (
              <View key={category.id} className="gap-2">
                <View className="flex-row justify-between">
                  <Typography className="text-caption text-neutral-500">
                    {category.name}
                  </Typography>

                  <Typography
                    weight="regular"
                    className="text-caption text-neutral-500"
                  >
                    {category.services?.filter((s) => s.is_active).length ?? 0}/
                    {category.services?.length ?? 0} активно
                  </Typography>
                </View>

                <View className="gap-2">
                  {category.services?.length ? (
                    map(category.services, (service) => (
                      <Card
                        key={service.id}
                        title={service.name}
                        titleProps={{
                          numberOfLines: 1,
                          ellipsizeMode: "tail",
                        }}
                        subtitle={`${service.duration} мин | ${(
                          service.price_cents / 100
                        ).toLocaleString("ru-RU")} ₽`}
                        titleAccessory={
                          !service.is_active ? (
                            <Tag title="скрыто" size="sm" />
                          ) : undefined
                        }
                        right={
                          <StSvg
                            name="Expand_right_light"
                            size={24}
                            color={colors.neutral[500]}
                          />
                        }
                        onPress={() =>
                          router.push(
                            Routers.app.menu.services.edit(
                              service.id,
                              category.id,
                            ),
                          )
                        }
                      />
                    ))
                  ) : (
                    <Button
                      title="Создать услугу"
                      onPress={() =>
                        router.push(
                          Routers.app.menu.services.create(category.id),
                        )
                      }
                      variant="secondary"
                      rightIcon={
                        <StSvg
                          name="Add_ring_fill_light"
                          size={18}
                          color={colors.neutral[900]}
                        />
                      }
                    />
                  )}
                </View>
              </View>
            ))}
          </ScrollView>
        </>
      )}
    </ScreenWithToolbar>
  );
};

export default AppServices;
