import React, { useCallback, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { AuthScreenLayout } from "@/src/components/auth/layout";
import AuthHeader from "@/src/components/auth/layout/header";
import AuthFooter from "@/src/components/auth/layout/footer";
import { View } from "react-native";
import { Avatar, Divider, Item, StSvg, Typography } from "@/src/components/ui";
import { RhfTextField } from "@/src/components/hookForm/rhf-text-field";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { StepProgress } from "@/src/components/ui/StepProgress";
import { router } from "expo-router";
import { Routers } from "@/src/constants/routers";
import RHFSwitch from "@/src/components/hookForm/rhf-switch";
import { RHFAutocomplete } from "@/src/components/hookForm/rhf-autocomplete";
import { colors } from "@/src/styles/colors";
import ImagePickerTrigger from "@/src/components/shared/imagePicker/imagePickerTrigger";
import { CameraType, ImagePickerAsset } from "expo-image-picker";
import { useUpdateUserMutation } from "@/src/store/redux/services/api/authApi";
import { RootState } from "@/src/store/redux/store";
import { useSelector } from "react-redux";
import { nameField } from "@/src/validation/fields/name";
import { surnameField } from "@/src/validation/fields/surname";
import { professionField } from "@/src/validation/fields/profession";
import { toast } from "@backpackapp-io/react-native-toast";
import { DocumentPickerAsset } from "expo-document-picker";

type PersonalInformationFormValues = {
  name: string;
  surname: string;
  profession: string;
  address?: Yup.Maybe<string | undefined>;
  atHome: boolean;
  online: boolean;
  onRoad: boolean;
  hideAddress: boolean;
};

type UploadFile = {
  uri: string;
  name: string;
  type: string;
};

const PersonalInformationSchema = Yup.object({
  name: nameField,
  surname: surnameField,
  profession: professionField,
  address: Yup.string().notRequired(),
  atHome: Yup.boolean().required(),
  online: Yup.boolean().required(),
  onRoad: Yup.boolean().required(),
  hideAddress: Yup.boolean().required(),
});

const PersonalInformation = () => {
  const [avatar, setAvatar] = useState<UploadFile | null>(null);
  const user = useSelector((state: RootState) => state.auth.user);
  const [updateUser, { isLoading }] = useUpdateUserMutation();

  const methods = useForm({
    resolver: yupResolver(PersonalInformationSchema),
    defaultValues: {
      name: user?.first_name ?? "",
      surname: user?.last_name ?? "",
      profession: user?.profession ?? "",
      address: user?.address ?? "",
      hideAddress: false,
      atHome: user?.is_home_work ?? false,
      online: user?.is_online_work ?? false,
      onRoad: user?.is_out_call ?? false,
    },
  });

  const onSubmit = useCallback(
    async (data: PersonalInformationFormValues) => {
      // This is now just a failsafe. The layout protects this route.
      if (!user?.id) return;

      try {
        const formData = new FormData();

        formData.append("user[first_name]", data.name);
        formData.append("user[last_name]", data.surname);
        formData.append("user[profession]", data.profession);

        if (data.address) {
          formData.append("user[address]", data.address);
        }

        formData.append("user[is_home_work]", String(data.atHome));
        formData.append("user[is_online_work]", String(data.online));
        formData.append("user[is_out_call]", String(data.onRoad));

        if (avatar?.uri) {
          formData.append("user[avatar]", {
            uri: avatar.uri,
            name: avatar.name || `avatar_${Date.now()}.jpg`,
            type: avatar.type || "image/jpeg",
          } as any);
        }

        await updateUser({
          id: user.id,
          data: formData,
        }).unwrap();

        router.push(Routers.auth.service);
      } catch (error: any) {
        console.log("UPDATE USER ERROR:", error);
        toast.error(
          error?.data?.error || "Произошла ошибка при обновлении профиля.",
        );
      }
    },
    [user, avatar, updateUser],
  );

  const handlePickAvatar = useCallback(
    (assets: (ImagePickerAsset | DocumentPickerAsset)[] | null) => {
      if (!assets?.[0]) return;
      const asset = assets[0];

      if (!("width" in asset)) {
        toast.error("Пожалуйста, выберите изображение.");
        return;
      }

      setAvatar({
        uri: asset.uri,
        name: asset.fileName || `file_${Date.now()}.jpg`,
        type: asset.mimeType || "image/jpeg",
      });
    },
    [],
  );

  return (
    <FormProvider {...methods}>
      <AuthScreenLayout
        avoidKeyboard
        header={<AuthHeader />}
        footer={
          <AuthFooter
            primary={{
              title: "Далее",
              disabled: isLoading,
              loading: isLoading,
              onPress: methods.handleSubmit(onSubmit),
            }}
          />
        }
      >
        <View className="mt-4">
          <StepProgress steps={3} currentStep={1} />
        </View>
        <View className="mt-8 gap-2">
          <Typography weight="semibold" className="text-display mb-2">
            Твоя визитка
          </Typography>
          <Typography className="text-body text-neutral-500">
            Чтобы клиенты знали, к кому идут
          </Typography>

          <View className="items-center my-4">
            <ImagePickerTrigger
              title="Загрузить аватар"
              options={{ aspect: [1, 1], cameraType: CameraType.front }}
              onPick={handlePickAvatar}
            >
              <Avatar
                size="xl"
                uri={avatar?.uri ?? undefined}
                fallbackIcon={
                  <StSvg name="Camera" size={40} color={colors.neutral[500]} />
                }
              />
            </ImagePickerTrigger>
          </View>
        </View>
        <View className="gap-2">
          <RhfTextField name="name" label="Имя" placeholder="Иван" />
          <RhfTextField name="surname" label="Фамилия" placeholder="Иванов" />
          <RhfTextField
            name="profession"
            label="Профессия"
            placeholder="Барбер"
          />
        </View>
        <Divider />
        <Typography className="text-neutral-500 text-caption mt-5">
          Формат работы
        </Typography>
        <View className="mt-2 mb-5 gap-2">
          <Item title="Дома/в студии" right={<RHFSwitch name="atHome" />} />
          <Item title="Онлайн" right={<RHFSwitch name="online" />} />
          <Item title="На выезд" right={<RHFSwitch name="onRoad" />} />
        </View>
        <View className="gap-2 mb-8">
          <RHFAutocomplete
            label="Адрес"
            placeholder="Москва, ул. Пушкина, 5"
            name="address"
            hideErrorText
            dataSet={[
              { id: "Alpha", title: "Alpha" },
              { id: "Beta", title: "Beta" },
              { id: "Gamma", title: "Gamma" },
            ]}
          />
          <Item
            title="Скрыть адрес"
            left={
              <StSvg
                name="View_hide_fill"
                size={24}
                color={colors.neutral[900]}
              />
            }
            right={<RHFSwitch name="hideAddress" />}
          />
        </View>
      </AuthScreenLayout>
    </FormProvider>
  );
};

export default PersonalInformation;
