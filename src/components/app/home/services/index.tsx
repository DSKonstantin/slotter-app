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
import ToolbarTop from "@/src/components/navigation/toolbarTop";
import { View } from "react-native";
import { TOOLBAR_HEIGHT } from "@/src/constants/tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Routers } from "@/src/constants/routers";

const categories = [
  {
    id: "1",
    name: "Стрижки",
    active: 4,
    total: 5,
    services: [
      {
        id: "1",
        title: "Стрижка женская",
        duration: 60,
        price: 3500,
        hidden: true,
      },
      {
        id: "2",
        title: "Стрижка мужская",
        duration: 45,
        price: 2500,
        hidden: false,
      },
    ],
  },
  {
    id: "2",
    name: "Окрашивание",
    active: 2,
    total: 3,
    services: [
      {
        id: "3",
        title: "Окрашивание корней",
        duration: 90,
        price: 4500,
        hidden: false,
      },
    ],
  },
];

const AppServices = () => {
  const { top } = useSafeAreaInsets();

  const createService = useCallback(() => {
    router.push(Routers.app.home.services.create);
  }, []);

  const createCategories = useCallback(() => {
    router.push(Routers.app.home.services.categories);
  }, []);

  return (
    <>
      <ToolbarTop
        title="Услуги"
        rightButton={
          <IconButton
            icon={<StSvg name="Search" size={28} color={colors.neutral[900]} />}
            onPress={() => {}}
          />
        }
      />

      <View
        className="flex-1 px-screen"
        style={{
          marginTop: TOOLBAR_HEIGHT + top,
        }}
      >
        <View className="flex-row gap-2.5">
          <Button
            title="Создать услугу"
            onPress={createService}
            rightIcon={
              <StSvg name="Add_ring_fill" size={24} color={colors.neutral[0]} />
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

        {categories.map((category) => (
          <View key={category.id} className="mt-5 gap-2">
            <View className="flex-row justify-between">
              <Typography className="text-caption text-neutral-500">
                {category.name}
              </Typography>

              <Typography
                weight="regular"
                className="text-caption text-neutral-500"
              >
                {category.active}/{category.total} активно
              </Typography>
            </View>

            <View className="gap-2">
              {category.services.map((service) => (
                <Card
                  key={service.id}
                  title={service.title}
                  subtitle={`${service.duration} мин | ${service.price.toLocaleString()} ₽`}
                  tag={
                    service.hidden ? (
                      <Tag title="скрыто" size="sm" />
                    ) : undefined
                  }
                  rightIcon={
                    <StSvg
                      name="Expand_right_light"
                      size={24}
                      color={colors.neutral[500]}
                    />
                  }
                />
              ))}
            </View>
          </View>
        ))}
      </View>
    </>
  );
};

export default AppServices;
