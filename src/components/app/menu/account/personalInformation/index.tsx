import React, { useCallback } from "react";
import { View } from "react-native";
import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { CameraType, ImagePickerAsset } from "expo-image-picker";
import { DocumentPickerAsset } from "expo-document-picker";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { toast } from "@backpackapp-io/react-native-toast";
import { router } from "expo-router";
import ScreenWithToolbar from "@/src/components/shared/layout/screenWithToolbar";
import { Avatar, Button, StSvg } from "@/src/components/ui";
import { RhfTextField } from "@/src/components/hookForm/rhf-text-field";
import ImagePickerTrigger from "@/src/components/shared/imagePicker/imagePickerTrigger";
import { useUpdateUserMutation } from "@/src/store/redux/services/api/authApi";
import { useAppSelector } from "@/src/store/redux/store";
import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";
import { getApiErrorMessage } from "@/src/utils/apiError";
import { buildUserFormData } from "@/src/utils/formData/buildUserFormData";
import { AccountPersonalInformationSchema } from "@/src/validation/schemas/accountPersonalInformation.schema";
import type { UploadFile } from "@/src/types/upload";
import { colors } from "@/src/styles/colors";
import { useFormNavigationGuard } from "@/src/hooks/useFormNavigationGuard";

type FormValues = {
  name: string;
  surname: string;
  profession: string;
  avatar: UploadFile | null;
};

const PersonalInformation = () => {
  const auth = useRequiredAuth();
  const user = useAppSelector((s) => s.auth.user);
  const [updateUser, { isLoading }] = useUpdateUserMutation();

  const methods = useForm<FormValues>({
    resolver: yupResolver(AccountPersonalInformationSchema),
    defaultValues: {
      name: user?.first_name ?? "",
      surname: user?.last_name ?? "",
      profession: user?.profession ?? "",
      avatar: null,
    },
  });

  useFormNavigationGuard(methods.formState.isDirty);

  const avatar = methods.watch("avatar");

  const handlePickAvatar = useCallback(
    (assets: ImagePickerAsset[] | DocumentPickerAsset[]) => {
      const asset = assets[0];
      if (!asset || !("width" in asset)) return;
      methods.setValue("avatar", {
        uri: asset.uri,
        name: asset.fileName || `avatar_${Date.now()}.jpg`,
        type: asset.mimeType || "image/jpeg",
      });
    },
    [methods],
  );

  const onSubmit = useCallback(
    async (data: FormValues) => {
      if (!auth) return;
      try {
        const formData = buildUserFormData(data);
        await updateUser({ id: auth.userId, data: formData }).unwrap();
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
      <ScreenWithToolbar title="Личная информация">
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
                <View className="items-center">
                  <ImagePickerTrigger
                    title="Фото профиля"
                    options={{ aspect: [1, 1], cameraType: CameraType.front }}
                    onPick={handlePickAvatar}
                  >
                    <Avatar
                      size="xl"
                      uri={avatar?.uri ?? user?.avatar_url ?? undefined}
                      showPhotoIcon={true}
                      fallbackIcon={
                        <StSvg
                          name="Camera"
                          size={40}
                          color={colors.neutral[500]}
                        />
                      }
                    />
                  </ImagePickerTrigger>
                </View>

                <View className="gap-1">
                  <RhfTextField name="name" label="Имя" placeholder="Иван" />
                  <RhfTextField
                    name="surname"
                    label="Фамилия"
                    placeholder="Иванов"
                  />
                  <RhfTextField
                    name="profession"
                    label="Специализация"
                    placeholder="Барбер"
                  />
                </View>
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

export default PersonalInformation;
