import React, { useState } from "react";
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
import { CameraType } from "expo-image-picker";
import { useUpdateUserMutation } from "@/src/store/redux/services/userApi";
import { RootState } from "@/src/store/redux/store";
import { useSelector } from "react-redux";
import { nameField } from "@/src/validation/fields/name";
import { surnameField } from "@/src/validation/fields/surname";
import { professionField } from "@/src/validation/fields/profession";

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

const VerifySchema = Yup.object({
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
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const user = useSelector((state: RootState) => state.auth.user);
  const [updateUser, { isLoading }] = useUpdateUserMutation();

  const methods = useForm({
    resolver: yupResolver(VerifySchema),
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

  const onSubmit = async (data: PersonalInformationFormValues) => {
    if (!user?.id) return;

    try {
      await updateUser({
        id: user.id,
        data: {
          first_name: data.name,
          last_name: data.surname,
          profession: data.profession,
          address: data.address,
          is_home_work: data.atHome,
          is_online_work: data.online,
          is_out_call: data.onRoad,
        },
      }).unwrap();

      router.push(Routers.auth.service);
    } catch (error) {
      console.log("UPDATE USER ERROR:", error);
    }
  };

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
              onPick={(assets) => setAvatarUri(assets[0]?.uri)}
            >
              <Avatar
                size="xl"
                uri={avatarUri ?? undefined}
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
