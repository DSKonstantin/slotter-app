import React, { useCallback, useState } from "react";
import { ScrollView, View } from "react-native";
import { router } from "expo-router";

import {
  Button,
  Divider,
  IconButton,
  StModal,
  StSvg,
} from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import { Routers } from "@/src/constants/routers";
import ScreenWithToolbar from "@/src/components/shared/layout/screenWithToolbar";
import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";
import ServiceList from "@/src/components/app/menu/services/list/serviceList";
import AdditionalList from "@/src/components/app/menu/services/list/additionalList";

const AppServices = () => {
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const auth = useRequiredAuth();

  const createServiceLink = useCallback(() => {
    setCreateModalVisible(false);
    router.push(Routers.app.menu.services.create());
  }, []);

  const createAdditionalServiceLink = useCallback(() => {
    setCreateModalVisible(false);
    router.push(Routers.app.menu.services.additionalServices.create);
  }, []);

  const createCategories = useCallback(() => {
    router.push(Routers.app.menu.services.categories);
  }, []);

  const createService = useCallback(() => {
    setCreateModalVisible(true);
  }, []);

  if (!auth) {
    return null;
  }

  return (
    <>
      <ScreenWithToolbar
        title="Услуги"
        rightButton={
          <View className="flex-row bg-background-surface h-[48px] items-center gap-4 rounded-full px-2.5">
            <IconButton
              size="sm"
              onPress={() => {}}
              icon={<StSvg name="Edit" size={24} color={colors.neutral[900]} />}
            />
            <IconButton
              size="sm"
              onPress={() => {}}
              icon={
                <StSvg name="Search" size={24} color={colors.neutral[900]} />
              }
            />
          </View>
        }
      >
        {({ topInset, bottomInset }) => {
          return (
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

              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                  gap: 24,
                  paddingBottom: bottomInset + 8,
                }}
              >
                <ServiceList />

                <View className="px-screen">
                  <Divider />
                </View>
                <AdditionalList />
              </ScrollView>
            </>
          );
        }}
      </ScreenWithToolbar>
      <StModal visible={createModalVisible} onClose={() => {}}>
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
