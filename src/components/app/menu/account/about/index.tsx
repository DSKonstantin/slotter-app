import React, { useCallback } from "react";
import { View } from "react-native";
import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  AccountAboutSchema,
  type AccountAboutFormValues,
} from "@/src/validation/schemas/accountAbout.schema";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { toast } from "@backpackapp-io/react-native-toast";
import { router } from "expo-router";
import ScreenWithToolbar from "@/src/components/shared/layout/screenWithToolbar";
import { Button, Item, StSvg, Typography } from "@/src/components/ui";
import { RhfTextField } from "@/src/components/hookForm/rhf-text-field";
import RHFSwitch from "@/src/components/hookForm/rhf-switch";
import { AddressField } from "@/src/components/shared/addressField";
import { useUpdateUserMutation } from "@/src/store/redux/services/api/authApi";
import { useAppSelector } from "@/src/store/redux/store";
import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";
import { getApiErrorMessage } from "@/src/utils/apiError";
import { colors } from "@/src/styles/colors";

const AboutSpecialist = () => {
  const auth = useRequiredAuth();
  const user = useAppSelector((s) => s.auth.user);
  const [updateUser, { isLoading }] = useUpdateUserMutation();

  const methods = useForm<AccountAboutFormValues>({
    resolver: yupResolver(AccountAboutSchema),
    defaultValues: {
      aboutMe: user?.about_me ?? "",
      tags: [],
      address: user?.address ?? "",
      hideAddress: false,
      atHome: user?.is_home_work ?? false,
      online: user?.is_online_work ?? false,
      onRoad: user?.is_out_call ?? false,
    },
  });

  const onSubmit = useCallback(
    async (data: AccountAboutFormValues) => {
      if (!auth) return;
      try {
        await updateUser({
          id: auth.userId,
          data: {
            about_me: data.aboutMe,
            address: data.address,
            is_home_work: data.atHome,
            is_online_work: data.online,
            is_out_call: data.onRoad,
          },
        }).unwrap();
        router.back();
      } catch (error) {
        toast.error(getApiErrorMessage(error, "Не удалось сохранить данные"));
      }
    },
    [auth, updateUser],
  );

  if (!auth) return null;

  return (
    <FormProvider {...methods}>
      <ScreenWithToolbar title="О специалисте">
        {({ topInset, bottomInset }) => (
          <>
            <KeyboardAwareScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                paddingTop: topInset + 16,
                paddingBottom: 16,
              }}
            >
              <View className="px-screen gap-4">
                <RhfTextField
                  name="aboutMe"
                  label="О себе"
                  placeholder="Расскажите о себе и своём опыте"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
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
                <AddressField />
              </View>
            </KeyboardAwareScrollView>

            <View
              className="px-screen"
              style={{ paddingBottom: bottomInset + 16 }}
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

export default AboutSpecialist;
