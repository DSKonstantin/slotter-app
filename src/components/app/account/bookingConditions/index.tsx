import React, { useCallback } from "react";
import { View } from "react-native";
import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  AccountBookingConditionsSchema,
  type AccountBookingConditionsFormValues,
} from "@/src/validation/schemas/accountBookingConditions.schema";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { toast } from "@backpackapp-io/react-native-toast";
import { router } from "expo-router";
import ScreenWithToolbar from "@/src/components/shared/layout/screenWithToolbar";
import { Button, StSvg, Typography } from "@/src/components/ui";
import { RhfTextField } from "@/src/components/hookForm/rhf-text-field";
import { useUpdateUserMutation } from "@/src/store/redux/services/api/usersApi";
import { useAppSelector } from "@/src/store/redux/store";
import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";
import { getApiErrorMessage } from "@/src/utils/apiError";
import { colors } from "@/src/styles/colors";
import { BOTTOM_OFFSET_SMALL } from "@/src/constants/tabs";
import { useFormNavigationGuard } from "@/src/hooks/useFormNavigationGuard";

const TIPS = [
  "Опиши конкретные правила: сроки отмены, что происходит при опоздании или болезни",
  "Клиент читает это один раз перед первой записью — коротко и по делу, без лишних слов",
  "Это не про тебя, а про порядок, советуем избегать общих фраз и писать как памятку",
];

const BookingConditions = () => {
  const auth = useRequiredAuth();
  const user = useAppSelector((s) => s.auth.user);
  const [updateUser, { isLoading }] = useUpdateUserMutation();

  const methods = useForm<AccountBookingConditionsFormValues>({
    resolver: yupResolver(AccountBookingConditionsSchema),
    defaultValues: {
      appointmentConditions: user?.appointment_conditions ?? "",
    },
  });

  useFormNavigationGuard(methods.formState.isDirty);

  const onSubmit = useCallback(
    async (data: AccountBookingConditionsFormValues) => {
      if (!auth) return;
      try {
        await updateUser({
          id: auth.userId,
          data: { appointment_conditions: data.appointmentConditions },
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
      <ScreenWithToolbar title="Условия записи">
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
                  name="appointmentConditions"
                  placeholder="Опишите условия записи"
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

export default BookingConditions;
