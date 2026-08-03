import React, { useCallback, useState } from "react";
import { Alert, Pressable, View } from "react-native";
import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { CameraType } from "expo-image-picker";
import type { PickedAssets } from "@/src/components/shared/imagePicker/imagePickerTrigger";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { toast } from "@backpackapp-io/react-native-toast";
import { router } from "expo-router";
import ScreenWithToolbar from "@/src/components/shared/layout/screenWithToolbar";
import {
  Avatar,
  Button,
  Divider,
  StModal,
  StSvg,
  Typography,
} from "@/src/components/ui";
import { RhfTextField } from "@/src/components/hookForm/rhf-text-field";
import { NicknameField } from "@/src/components/onboarding/personalInformation/NicknameField";
import ImagePickerTrigger from "@/src/components/shared/imagePicker/imagePickerTrigger";
import AvatarViewer from "./AvatarViewer";
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
  nickname: string;
  avatar: UploadFile | null;
};

const PersonalInformation = () => {
  const auth = useRequiredAuth();
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [avatarViewerVisible, setAvatarViewerVisible] = useState(false);
  const [avatarRemoved, setAvatarRemoved] = useState(false);

  const user = useAppSelector((s) => s.auth.user);
  const { logout } = useAuth();
  const [updateUser, { isLoading }] = useUpdateUserMutation();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();

  const methods = useForm<FormValues>({
    resolver: yupResolver(AccountPersonalInformationSchema),
    defaultValues: {
      name: user?.first_name ?? "",
      surname: user?.last_name ?? "",
      profession: user?.profession ?? "",
      nickname: user?.nickname ?? "",
      avatar: null,
    },
  });

  useFormNavigationGuard(methods.formState.isDirty || avatarRemoved);

  const avatar = methods.watch("avatar");
  const avatarUri = avatarRemoved
    ? undefined
    : (avatar?.uri ?? user?.avatar_url ?? undefined);

  const handlePickAvatar = useCallback(
    (assets: PickedAssets) => {
      const asset = assets[0];
      if (!asset) return;
      setAvatarRemoved(false);
      methods.setValue("avatar", assetToFile(asset, "avatar.jpg"), {
        shouldDirty: true,
      });
    },
    [methods],
  );

  const handleRemoveAvatar = useCallback(
    (onConfirmed?: () => void) => {
      Alert.alert("Удалить фото профиля?", "Фото будет удалено", [
        { text: "Отмена", style: "cancel" },
        {
          text: "Удалить",
          style: "destructive",
          onPress: () => {
            setAvatarRemoved(true);
            methods.setValue("avatar", null, { shouldDirty: true });
            onConfirmed?.();
          },
        },
      ]);
    },
    [methods],
  );

  const onSubmit = useCallback(
    async (data: FormValues) => {
      if (!auth) return;
      try {
        const formData = buildUserFormData({
          ...data,
          removeAvatar: avatarRemoved,
        });
        formData.append("user[nickname]", data.nickname);
        await updateUser({ id: auth.userId, data: formData }).unwrap();
        methods.reset(data);
        setAvatarRemoved(false);
        router.back();
      } catch (error) {
        toast.error(getApiErrorMessage(error, "Не удалось сохранить данные"));
      }
    },
    [auth, updateUser, methods, avatarRemoved],
  );

  const handleConfirmDelete = useCallback(async () => {
    if (!auth) return;
    try {
      await deleteUser(auth.userId).unwrap();
      setDeleteModalVisible(false);
      methods.reset(methods.getValues());
      await logout();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Не удалось удалить профиль"));
    }
  }, [auth, deleteUser, logout, methods]);

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
              <View className="px-screen gap-2">
                <View className="gap-1">
                  <Typography className="text-neutral-500 text-caption">
                    Аватар
                  </Typography>
                  <View className="relative self-start">
                    {avatarUri ? (
                      <Pressable
                        onPress={() => setAvatarViewerVisible(true)}
                        className="active:opacity-70"
                      >
                        <Avatar
                          size="xl"
                          uri={avatarUri}
                          blurhash={avatar ? undefined : user?.avatar_blurhash}
                          fallbackIcon={
                            <StSvg
                              name="Camera"
                              size={40}
                              color={colors.neutral[500]}
                            />
                          }
                        />
                      </Pressable>
                    ) : (
                      <ImagePickerTrigger
                        title="Фото профиля"
                        options={{
                          aspect: [1, 1],
                          cameraType: CameraType.front,
                        }}
                        includeFiles
                        onPick={handlePickAvatar}
                      >
                        <Avatar
                          size="xl"
                          uri={undefined}
                          fallbackIcon={
                            <StSvg
                              name="Camera"
                              size={40}
                              color={colors.neutral[500]}
                            />
                          }
                        />
                      </ImagePickerTrigger>
                    )}
                    <View className="absolute -bottom-1 -right-1 bg-background-surface rounded-full p-1.5">
                      <StSvg
                        name="Edit_fill"
                        size={16}
                        color={colors.neutral[900]}
                      />
                    </View>
                  </View>
                </View>

                <View className="gap-1">
                  <RhfTextField name="name" label="Имя" placeholder="Иван" />
                  <RhfTextField
                    name="surname"
                    label="Фамилия"
                    placeholder="Иванов"
                  />
                </View>

                <Divider />

                <View className="gap-1 mt-5">
                  <NicknameField />
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
                  buttonClassName="bg-background-surface"
                  onPress={handleConfirmDelete}
                  loading={isDeleting}
                  disabled={isDeleting}
                />
                <Button
                  title="Отмена"
                  onPress={() => setDeleteModalVisible(false)}
                  disabled={isDeleting}
                />
              </View>
            </StModal>

            {avatarViewerVisible && avatarUri && (
              <AvatarViewer
                uri={avatarUri}
                onClose={() => setAvatarViewerVisible(false)}
                onPick={handlePickAvatar}
                onDelete={() =>
                  handleRemoveAvatar(() => setAvatarViewerVisible(false))
                }
              />
            )}
          </>
        )}
      </ScreenWithToolbar>
    </FormProvider>
  );
};

export default PersonalInformation;
