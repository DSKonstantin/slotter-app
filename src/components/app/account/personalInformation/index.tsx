import React, { useCallback } from "react";
import { View } from "react-native";
import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { CameraType, ImagePickerAsset } from "expo-image-picker";
import { DocumentPickerAsset } from "expo-document-picker";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { toast } from "@backpackapp-io/react-native-toast";
import { router } from "expo-router";
import ScreenWithToolbar from "@/src/components/shared/layout/screenWithToolbar";
import { Avatar, Button, StSvg } from "@/src/components/ui";
import { RhfTextField } from "@/src/components/hookForm/rhf-text-field";
import ImagePickerTrigger from "@/src/components/shared/imagePicker/imagePickerTrigger";
import { useUpdateCustomerMutation } from "@/src/store/redux/services/api/usersApi";
import { useAppSelector } from "@/src/store/redux/store";
import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";
import { getApiErrorMessage } from "@/src/utils/apiError";
import { buildCustomerFormData } from "@/src/utils/formData/buildCustomerFormData";
import { assetToFile } from "@/src/utils/files/assetToFile";
import { nameField } from "@/src/validation/fields/name";
import { avatarField } from "@/src/validation/fields/avatar";
import type { UploadFile } from "@/src/types/upload";
import { colors } from "@/src/styles/colors";
import { useFormNavigationGuard } from "@/src/hooks/useFormNavigationGuard";

const schema = Yup.object({ name: nameField, avatar: avatarField });
type FormValues = { name: string; avatar: UploadFile | null };

const PersonalInformation = () => {
  const auth = useRequiredAuth();
  const user = useAppSelector((s) => s.auth.user);
  const [updateCustomer, { isLoading }] = useUpdateCustomerMutation();

  const methods = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: user?.name ?? "",
      avatar: null,
    },
  });

  useFormNavigationGuard(methods.formState.isDirty);

  const avatar = methods.watch("avatar");

  const handlePickAvatar = useCallback(
    (assets: ImagePickerAsset[] | DocumentPickerAsset[]) => {
      const asset = assets[0];
      if (!asset || !("width" in asset)) return;
      methods.setValue("avatar", assetToFile(asset, "avatar.jpg"));
    },
    [methods],
  );

  const onSubmit = useCallback(
    async (data: FormValues) => {
      if (!auth) return;
      try {
        const formData = buildCustomerFormData(data);
        await updateCustomer({ id: auth.userId, data: formData }).unwrap();
        methods.reset(data);
        router.back();
      } catch (error) {
        toast.error(getApiErrorMessage(error, "Не удалось сохранить данные"));
      }
    },
    [auth, updateCustomer, methods],
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
                      blurhash={avatar ? undefined : user?.avatar_blurhash}
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

                <RhfTextField
                  name="name"
                  label="Имя"
                  placeholder="Иван Иванов"
                />
              </View>
            </KeyboardAwareScrollView>

            <View
              className="px-screen gap-4"
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

export default PersonalInformation;
