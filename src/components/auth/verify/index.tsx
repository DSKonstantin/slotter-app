import React, { useCallback, useEffect, useState } from "react";
import { View } from "react-native";
import * as WebBrowser from "expo-web-browser";
import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import { AuthScreenLayout } from "@/src/components/auth/layout";
import AuthHeader from "@/src/components/auth/layout/header";
import AuthFooter from "@/src/components/auth/layout/footer";
import { useAccountDeactivatedModal } from "@/src/components/auth/useAccountDeactivatedModal";
import { AuthMethodsFlowSheet } from "@/src/components/auth/AuthMethodsFlowSheet";
import { useAuthMethodsFlow } from "@/src/components/auth/useAuthMethodsFlow";
import RhfCheckbox from "@/src/components/hookForm/rhf-checkbox";
import { RhfTextField } from "@/src/components/hookForm/rhf-text-field";
import { Button, Typography } from "@/src/components/ui";
import { useLazyValidateReferralCodeQuery } from "@/src/store/redux/services/api/referralApi";
import { useAppSelector } from "@/src/store/redux/store";
import { maskPhone, normalizePhone } from "@/src/utils/mask/maskPhone";
import { VerifySchema } from "@/src/validation/schemas/verify.schema";

type CodeState = { status: "idle" | "valid" | "invalid"; error: string };

const openDocument = (path: string) =>
  WebBrowser.openBrowserAsync(
    `${process.env.EXPO_PUBLIC_BOOKING_BASE_URL}/${path}`,
  );

const INITIAL_CODE_STATE: CodeState = { status: "idle", error: "" };

const Verify = () => {
  const [codeState, setCodeState] = useState<CodeState>(INITIAL_CODE_STATE);

  const ispe = useAppSelector((s) => s.appVersion.ispe);
  const [validateReferralCode, { isFetching: isValidating }] =
    useLazyValidateReferralCodeQuery();
  const methods = useForm({
    resolver: yupResolver(VerifySchema),
    defaultValues: {
      phone: "",
      promoCode: "",
      agreedToTerms: false,
      agreedToPersonalData: false,
    },
  });

  const rawPhone = methods.watch("phone");
  const promoCode = methods.watch("promoCode") ?? "";
  const sessionPhone = normalizePhone(rawPhone);
  const sessionReferralCode = promoCode.trim() || undefined;

  const { show: showAccountDeactivated, modal: accountDeactivatedModal } =
    useAccountDeactivatedModal();

  const authMethods = useAuthMethodsFlow({
    phone: sessionPhone,
    referralCode: sessionReferralCode,
    onAccountDeactivated: showAccountDeactivated,
  });

  const handleValidateCode = useCallback(async () => {
    const code = promoCode.trim();
    if (!code) return;
    try {
      const result = await validateReferralCode({ code }).unwrap();
      if (result.valid) {
        setCodeState({ status: "valid", error: "" });
      } else {
        setCodeState({ status: "invalid", error: result.error });
      }
    } catch {
      setCodeState({ status: "invalid", error: "Не удалось проверить код" });
    }
  }, [promoCode, validateReferralCode]);

  useEffect(() => {
    setCodeState(INITIAL_CODE_STATE);
  }, [promoCode]);

  const trimmedPromo = promoCode.trim();
  const isPromoEntered = trimmedPromo.length >= 4;

  return (
    <FormProvider {...methods}>
      <AuthScreenLayout
        avoidKeyboard
        stickyFooter
        header={<AuthHeader />}
        footer={
          <AuthFooter
            primary={{
              title: "Продолжить",
              disabled: authMethods.isPending,
              loading: authMethods.isPending,
              onPress: methods.handleSubmit(authMethods.openSheet),
            }}
          />
        }
      >
        <View className="mt-8">
          <Typography weight="semibold" className="text-display mb-2">
            Твой номер
          </Typography>
          <Typography className="text-body text-neutral-500">
            Введи телефон, и мы покажем способы авторизации
          </Typography>

          <View className="mt-9">
            <RhfTextField
              name="phone"
              placeholder="+ 7 999 000-00-00"
              maskFn={maskPhone}
              hideErrorText
              keyboardType="number-pad"
            />
            <Typography className="text-caption text-neutral-500 mt-2 mb-4">
              Продолжая, вы соглашаетесь с{" "}
              <Typography
                className="text-caption text-black underline"
                onPress={() => openDocument("user-agreement")}
              >
                условиями использования
              </Typography>
            </Typography>
            {ispe && (
              <>
                <RhfTextField
                  name="promoCode"
                  label="Если вас пригласили или вы попали на акцию"
                  placeholder="Промокод"
                  hideErrorText
                  autoCapitalize="characters"
                  maxLength={16}
                  success={codeState.status === "valid"}
                />
                <View className="mt-2">
                  <Button
                    title="Проверить"
                    variant="secondary"
                    size="sm"
                    loading={isValidating}
                    disabled={!isPromoEntered || isValidating}
                    onPress={handleValidateCode}
                  />
                </View>
                {codeState.status === "valid" && (
                  <Typography className="text-caption text-primary-green-700 mt-2">
                    Промокод действителен
                  </Typography>
                )}
                {codeState.status === "invalid" && (
                  <Typography className="text-caption text-accent-red-500 mt-2">
                    {codeState.error}
                  </Typography>
                )}
              </>
            )}
            <View className="my-3">
              <View className="flex-row items-center gap-3">
                <RhfCheckbox name="agreedToTerms" />
                <Typography className="text-caption text-neutral-700 flex-1">
                  Я даю ООО «Slotter» согласие на{" "}
                  <Typography
                    className="text-caption text-black underline"
                    onPress={() => openDocument("data-processing")}
                  >
                    обработку персональных данных
                  </Typography>
                </Typography>
              </View>
              {methods.formState.errors.agreedToTerms && (
                <Typography className="text-caption text-accent-red-500 mt-1 ml-1">
                  {methods.formState.errors.agreedToTerms.message}
                </Typography>
              )}
            </View>
            <View className="flex-row items-center gap-3 mb-9">
              <RhfCheckbox name="agreedToPersonalData" />
              <Typography className="text-caption text-neutral-700 flex-1">
                Я согласен получать информационные и рекламные сообщения на
                указанный телефон и email{" "}
                <Typography
                  className="text-caption text-black underline"
                  onPress={() => openDocument("data-processing")}
                >
                  (условия)
                </Typography>
              </Typography>
            </View>
          </View>
        </View>
      </AuthScreenLayout>

      <AuthMethodsFlowSheet flow={authMethods} />

      {accountDeactivatedModal}
    </FormProvider>
  );
};

export default Verify;
