import React, { useCallback } from "react";
import { View } from "react-native";
import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  AccountAboutMeSchema,
  type AccountAboutMeFormValues,
} from "@/src/validation/schemas/accountAboutMe.schema";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { toast } from "@backpackapp-io/react-native-toast";
import { router } from "expo-router";
import ScreenWithToolbar from "@/src/components/shared/layout/screenWithToolbar";
import { Typography } from "@/src/components/ui";
import { RhfTextField } from "@/src/components/hookForm/rhf-text-field";
import { FormSaveFooter } from "@/src/components/hookForm/FormSaveFooter";
import { useUpdateUserMutation } from "@/src/store/redux/services/api/usersApi";
import { useAppSelector } from "@/src/store/redux/store";
import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";
import { getApiErrorMessage } from "@/src/utils/apiError";
import { BOTTOM_OFFSET_SMALL } from "@/src/constants/tabs";
import { useFormNavigationGuard } from "@/src/hooks/useFormNavigationGuard";

const TIPS = [
  "Укажи специализацию и опыт (окрашивание, сложные техники, 8 лет практики)",
  "Конкретика работает лучше общих фраз. Клиенты выбирают по деталям",
  "Оптимально 2-3 предложения — длиннее не дочитывают",
];

const AboutMe = () => {
  const auth = useRequiredAuth();
  const user = useAppSelector((s) => s.auth.user);
  const [updateUser, { isLoading }] = useUpdateUserMutation();

  const methods = useForm<AccountAboutMeFormValues>({
    resolver: yupResolver(AccountAboutMeSchema),
    defaultValues: {
      aboutMe: user?.about_me ?? "",
    },
  });

  useFormNavigationGuard(methods.formState.isDirty);

  const onSubmit = useCallback(
    async (data: AccountAboutMeFormValues) => {
      if (!auth) return;
      try {
        await updateUser({
          id: auth.userId,
          data: { about_me: data.aboutMe },
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
      <ScreenWithToolbar title="О себе">
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
                <RhfTextField
                  name="aboutMe"
                  placeholder="Расскажите о себе и своём опыте"
                  multiline
                  hideErrorText
                  numberOfLines={4}
                  textAlignVertical="top"
                />

                <View className="gap-2">
                  {TIPS.map((tip) => (
                    <View key={tip} className="flex-row gap-2">
                      <Typography
                        weight="regular"
                        className="text-caption text-neutral-500"
                      >
                        •
                      </Typography>
                      <Typography
                        weight="regular"
                        className="flex-1 text-caption text-neutral-500"
                      >
                        {tip}
                      </Typography>
                    </View>
                  ))}
                </View>
              </View>
            </KeyboardAwareScrollView>

            <FormSaveFooter
              bottomInset={bottomInset}
              loading={isLoading}
              onPress={methods.handleSubmit(onSubmit)}
            />
          </>
        )}
      </ScreenWithToolbar>
    </FormProvider>
  );
};

export default AboutMe;
