import React, { useCallback, useState } from "react";
import { View } from "react-native";
import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { CameraType, ImagePickerAsset } from "expo-image-picker";
import { DocumentPickerAsset } from "expo-document-picker";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { toast } from "@backpackapp-io/react-native-toast";
import { router } from "expo-router";
import ScreenWithToolbar from "@/src/components/shared/layout/screenWithToolbar";
import {
  Avatar,
  Button,
  StModal,
  StSvg,
  Typography,
} from "@/src/components/ui";
import { RhfTextField } from "@/src/components/hookForm/rhf-text-field";
import ImagePickerTrigger from "@/src/components/shared/imagePicker/imagePickerTrigger";
import {
  useDeleteUserMutation,
  useUpdateUserMutation,
} from "@/src/store/redux/services/api/usersApi";
import { useAppSelector } from "@/src/store/redux/store";
import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";
import { useAuth } from "@/src/contexts/AuthContext";
import { getApiErrorMessage } from "@/src/utils/apiError";
import { buildUserFormData } from "@/src/utils/formData/buildUserFormData";
import { assetToFile } from "@/src/utils/files/assetToFile";
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
  const { logout } = useAuth();
  const [updateUser, { isLoading }] = useUpdateUserMutation();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  const methods = useForm<FormValues>({
    resolver: yupResolver(AccountPersonalInformationSchema),
    defaultValues: {
      name: user?.first_name ?? "",
      surname: user?.last_name ?? "",
      profession: user?.profession ?? "",
      avatar: null,
    },
  });

  const { release } = useFormNavigationGuard(methods.formState.isDirty);

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
        const formData = buildUserFormData(data);
        await updateUser({ id: auth.userId, data: formData }).unwrap();
        release();
        router.back();
      } catch (error) {
        toast.error(getApiErrorMessage(error, "Не удалось сохранить данные"));
      }
    },
    [auth, updateUser, release],
  );

  const handleConfirmDelete = useCallback(async () => {
    if (!auth) return;
    try {
      await deleteUser(auth.userId).unwrap();
      setDeleteModalVisible(false);
      release();
      await logout();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Не удалось удалить профиль"));
    }
  }, [auth, deleteUser, logout, release]);

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
              className="px-screen gap-4"
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
              <Button
                title="Удалить профиль"
                variant="clear"
                onPress={() => setDeleteModalVisible(true)}
                textClassName="text-accent-red-500"
                rightIcon={
                  <StSvg
                    name="Trash"
                    size={24}
                    color={colors.accent.red[500]}
                  />
                }
                disabled={isDeleting}
              />
            </View>

            <StModal
              visible={deleteModalVisible}
              onClose={() => setDeleteModalVisible(false)}
            >
              <Typography
                weight="semibold"
                className="text-display text-center mb-3"
              >
                Удалить профиль?
              </Typography>
              <Typography className="text-body text-center mb-6">
                Аккаунт будет удалён. Это действие нельзя отменить.
              </Typography>
              <View className="gap-3">
                <Button
                  title="Удалить"
                  variant="destructive"
                  onPress={handleConfirmDelete}
                  loading={isDeleting}
                  disabled={isDeleting}
                />
                <Button
                  title="Отмена"
                  variant="clear"
                  onPress={() => setDeleteModalVisible(false)}
                  disabled={isDeleting}
                />
              </View>
            </StModal>
          </>
        )}
      </ScreenWithToolbar>
    </FormProvider>
  );
};

export default PersonalInformation;
