import React, { useCallback } from "react";
import { View } from "react-native";
import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  AccountProfileSettingsSchema,
  type AccountProfileSettingsFormValues,
} from "@/src/validation/schemas/accountProfileSettings.schema";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { toast } from "@backpackapp-io/react-native-toast";
import { router } from "expo-router";
import ScreenWithToolbar from "@/src/components/shared/layout/screenWithToolbar";
import { Button, Item, StSvg, Typography } from "@/src/components/ui";
import RHFSwitch from "@/src/components/hookForm/rhf-switch";
import { useUpdateUserMutation } from "@/src/store/redux/services/api/usersApi";
import { useAppSelector } from "@/src/store/redux/store";
import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";
import { getApiErrorMessage } from "@/src/utils/apiError";
import { colors } from "@/src/styles/colors";
import { Routers } from "@/src/constants/routers";
import { BOTTOM_OFFSET_SMALL } from "@/src/constants/tabs";
import { useFormNavigationGuard } from "@/src/hooks/useFormNavigationGuard";
import { NicknameField } from "@/src/components/onboarding/personalInformation/NicknameField";

const ProfileSettings = () => {
  const auth = useRequiredAuth();
  const user = useAppSelector((s) => s.auth.user);
  const [updateUser, { isLoading }] = useUpdateUserMutation();

  const methods = useForm<AccountProfileSettingsFormValues>({
    resolver: yupResolver(AccountProfileSettingsSchema),
    defaultValues: {
      nickname: user?.nickname ?? "",
      tags: [],
      atHome: user?.is_home_work ?? false,
      online: user?.is_online_work ?? false,
      onRoad: user?.is_out_call ?? false,
    },
  });

  useFormNavigationGuard(methods.formState.isDirty);

  const onSubmit = useCallback(
    async (data: AccountProfileSettingsFormValues) => {
      if (!auth) return;
      try {
        await updateUser({
          id: auth.userId,
          data: {
            nickname: data.nickname,
            is_home_work: data.atHome,
            is_online_work: data.online,
            is_out_call: data.onRoad,
          },
        }).unwrap();
        methods.reset(data);
        router.back();
      } catch (error) {
        toast.error(getApiErrorMessage(error, "Не удалось сохранить данные"));
      }
    },
    [auth, updateUser, methods],
  );

  if (!auth) return null;

  return (
    <FormProvider {...methods}>
      <ScreenWithToolbar title="Настройки профиля">
        {({ topInset, bottomInset }) => (
          <>
            <KeyboardAwareScrollView
              showsVerticalScrollIndicator={false}
              bottomOffset={BOTTOM_OFFSET_SMALL}
              contentContainerStyle={{
                paddingTop: topInset,
                paddingBottom: 16,
              }}
            >
              <View className="px-screen gap-4">
                <View className="bg-background-surface rounded-base overflow-hidden">
                  <Item
                    title="О себе"
                    className="border-0 rounded-none"
                    left={
                      <StSvg
                        name="User_circle"
                        size={24}
                        color={colors.neutral[900]}
                      />
                    }
                    right={
                      <StSvg
                        name="Expand_right"
                        size={20}
                        color={colors.neutral[400]}
                      />
                    }
                    onPress={() => router.push(Routers.app.account.aboutMe)}
                  />
                </View>
                <View>
                  <Typography className="text-neutral-500 text-caption mb-2">
                    Виды работы
                  </Typography>
                  <View className="gap-2">
                    <Item
                      title="Дома / в студии"
                      right={<RHFSwitch name="atHome" />}
                    />
                    <Item title="Онлайн" right={<RHFSwitch name="online" />} />
                    <Item
                      title="На выезд"
                      right={<RHFSwitch name="onRoad" />}
                    />
                  </View>
                </View>
                <NicknameField />
              </View>
            </KeyboardAwareScrollView>

            <View
              className="px-screen"
              style={{ paddingBottom: bottomInset + 8 }}
            >
              <Button
                title="Сохранить изменения"
                onPress={methods.handleSubmit(onSubmit)}
                rightIcon={
                  <StSvg name="Save_fill" size={24} color={colors.neutral[0]} />
                }
                loading={isLoading}
                disabled={isLoading}
              />
            </View>
          </>
        )}
      </ScreenWithToolbar>
    </FormProvider>
  );
};

export default ProfileSettings;
