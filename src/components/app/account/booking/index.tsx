import React, { useState, useRef, useCallback } from "react";
import { Pressable, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { FormProvider, useController, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  AccountBookingSchema,
  type AccountBookingFormValues,
} from "@/src/validation/schemas/accountBooking.schema";
import { router } from "expo-router";
import ScreenWithToolbar from "@/src/components/shared/layout/screenWithToolbar";
import {
  Button,
  Divider,
  IconButton,
  Input,
  Item,
  StModal,
  StSvg,
  Switch,
  Typography,
} from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import { Routers } from "@/src/constants/routers";
import { useAppSelector } from "@/src/store/redux/store";
import { useUpdateUserMutation } from "@/src/store/redux/services/api/usersApi";
import type { AppointmentStep } from "@/src/store/redux/services/api-types";
import { toast } from "@backpackapp-io/react-native-toast";
import { getApiErrorMessage } from "@/src/utils/apiError";
import { BOTTOM_OFFSET_SMALL } from "@/src/constants/tabs";

const DEFAULT_CONSENT_TEXT =
  "Обработку персональных данных осуществляет оператор - ООО Организация (ИНН 12345678910). Даю свое согласие на обработку моих персональных данных, а именно: Настоящее согласие предоставляется на совершении следующих действий с персональными данными: сбор, запись, систематизация, хранение, уточнение (обновление, изменение), использование, обезличивание, удаление, уничтожение.";

const BOOKING_STEPS: { label: string; value: AppointmentStep }[] = [
  { label: "5 минут", value: "five_minutes" },
  { label: "10 минут", value: "ten_minutes" },
  { label: "15 минут", value: "fifteen_minutes" },
  { label: "30 минут", value: "thirty_minutes" },
  { label: "1 час", value: "one_hour" },
  { label: "2 часа", value: "two_hours" },
  { label: "3 чаа", value: "three_hours" },
  { label: "4 часа", value: "four_hours" },
];

const formatStep = (value: AppointmentStep) =>
  BOOKING_STEPS.find((s) => s.value === value)?.label ?? value;

function BookingStepField({ onSelect }: { onSelect: () => void }) {
  const [modalVisible, setModalVisible] = useState(false);
  const { field } = useController<AccountBookingFormValues, "bookingStep">({
    name: "bookingStep",
  });

  return (
    <>
      <Item
        title="Шаг записи"
        className="border-0"
        right={
          <View className="flex-row items-center gap-1">
            <Typography className="text-neutral-500 text-body">
              {formatStep(field.value)}
            </Typography>
            <StSvg name="Expand_right" size={20} color={colors.neutral[400]} />
          </View>
        }
        onPress={() => setModalVisible(true)}
      />

      <StModal visible={modalVisible} onClose={() => setModalVisible(false)}>
        <View className="gap-2">
          {BOOKING_STEPS.map((step) => (
            <Item
              key={step.value}
              title={step.label}
              onPress={() => {
                field.onChange(step.value);
                setModalVisible(false);
                onSelect();
              }}
              right={
                field.value === step.value ? (
                  <StSvg
                    name="Check_fill"
                    size={24}
                    color={colors.primary.blue[500]}
                  />
                ) : null
              }
            />
          ))}
        </View>
      </StModal>
    </>
  );
}

const Booking = () => {
  const user = useAppSelector((s) => s.auth.user);
  const [updateUser, { isLoading: isSaving }] = useUpdateUserMutation();

  const [requiresConsent, setRequiresConsent] = useState(
    user?.is_personal_data_consent_enabled ?? false
  );
  const [consentText, setConsentText] = useState(
    user?.personal_data_consent_text ?? ""
  );
  const [requiresMarketingConsent, setRequiresMarketingConsent] = useState(
    user?.is_marketing_consent_enabled ?? false
  );
  const [consentInfoVisible, setConsentInfoVisible] = useState(false);

  const methods = useForm<AccountBookingFormValues>({
    resolver: yupResolver(AccountBookingSchema),
    defaultValues: {
      bookingStep: user?.appointment_step ?? "one_hour",
    },
  });

  const onSubmit = async (values: AccountBookingFormValues) => {
    if (!user) return;
    try {
      await updateUser({
        id: user.id,
        data: { appointment_step: values.bookingStep },
      }).unwrap();
    } catch (e) {
      toast.error(getApiErrorMessage(e, "Не удалось сохранить настройки"));
    }
  };

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const saveConsents = useCallback(
    (params: {
      consent: boolean;
      text: string;
      marketing: boolean;
    }) => {
      if (!user) return;
      if (debounceRef.current) clearTimeout(debounceRef.current);

      debounceRef.current = setTimeout(async () => {
        try {
          await updateUser({
            id: user.id,
            data: {
              is_personal_data_consent_enabled: params.consent,
              personal_data_consent_text: params.text || null,
              is_marketing_consent_enabled: params.marketing,
            },
          }).unwrap();
        } catch (e) {
          toast.error(getApiErrorMessage(e, "Не удалось сохранить согласия"));
        }
      }, 500);
    },
    [user, updateUser],
  );

  const handleConsentToggle = (value: boolean) => {
    setRequiresConsent(value);
    saveConsents({ consent: value, text: consentText, marketing: requiresMarketingConsent });
  };

  const handleConsentTextChange = (text: string) => {
    setConsentText(text);
    saveConsents({ consent: requiresConsent, text, marketing: requiresMarketingConsent });
  };

  const handleMarketingConsentToggle = (value: boolean) => {
    setRequiresMarketingConsent(value);
    saveConsents({ consent: requiresConsent, text: consentText, marketing: value });
  };

  return (
    <FormProvider {...methods}>
      <ScreenWithToolbar title="Онлайн запись">
        {({ topInset, bottomInset }) => (
          <KeyboardAwareScrollView
            showsVerticalScrollIndicator={false}
            bottomOffset={BOTTOM_OFFSET_SMALL}
            contentContainerStyle={{
              paddingTop: topInset,
              paddingBottom: bottomInset + 16,
            }}
            className="px-screen"
          >
            <View className="gap-4">
              <View className="bg-background-surface rounded-base">
                <BookingStepField
                  onSelect={() => methods.handleSubmit(onSubmit)()}
                />
                <View className="px-4">
                  <Divider />
                </View>

                <Item
                  title="Условия записи"
                  className="border-0"
                  right={
                    <StSvg
                      name="Expand_right"
                      size={20}
                      color={colors.neutral[400]}
                    />
                  }
                  onPress={() =>
                    router.push(Routers.app.account.bookingConditions)
                  }
                />
              </View>

              <View className="bg-background-surface rounded-base p-4 gap-3">
                <View className="flex-row items-start justify-between gap-3">
                  <View className="flex-1 flex-row flex-wrap items-center gap-1.5">
                    <Typography
                      weight="medium"
                      className="flex-shrink text-body"
                    >
                      Запрашивать согласие у клиентов
                    </Typography>
                  </View>
                  <View className="flex-row gap-1 items-center">
                    <Pressable
                      className="active:opacity-70"
                      onPress={() => setConsentInfoVisible(true)}
                    >
                      <StSvg
                        name="Info_alt_fill"
                        size={28}
                        color={colors.primary.blue[500]}
                      />
                    </Pressable>
                    <Switch
                      disabled={isSaving}
                      value={requiresConsent}
                      onChange={handleConsentToggle}
                    />
                  </View>
                </View>
                <Typography
                  weight="regular"
                  className="text-caption text-neutral-500"
                >
                  При онлайн-записи клиенту будет предложено подтвердить своё
                  согласие на обработку персональных данных единоразово для
                  каждой редакции текста. Полученное согласие будет храниться в
                  карточке клиента
                </Typography>

                {requiresConsent && (
                  <View className="gap-2">
                    <Divider />
                    <Typography className="text-caption text-neutral-500">
                      Текст согласия
                    </Typography>
                    <Input
                      multiline
                      numberOfLines={4}
                      hideErrorText
                      editable={!isSaving}
                      fieldClassName="bg-background"
                      placeholder="Стандартный текст согласия на обработку персональных данных"
                      value={consentText}
                      onChangeText={handleConsentTextChange}
                    />
                    <View className="flex-row items-center justify-between">
                      <Pressable
                        disabled={isSaving}
                        className="active:opacity-70"
                        onPress={() => {
                          const template =
                            user?.personal_data_consent_template ||
                            DEFAULT_CONSENT_TEXT;
                          handleConsentTextChange(template);
                        }}
                      >
                        <Typography
                          weight="medium"
                          className={`text-caption ${isSaving ? "text-neutral-300" : "text-primary-blue-500"}`}
                        >
                          Применить стандартный шаблон
                        </Typography>
                      </Pressable>
                      <Pressable
                        disabled={isSaving}
                        className="active:opacity-70"
                        onPress={() => handleConsentTextChange("")}
                      >
                        <Typography
                          weight="regular"
                          className={`text-caption ${isSaving ? "text-neutral-300" : "text-neutral-500"}`}
                        >
                          Очистить
                        </Typography>
                      </Pressable>
                    </View>
                  </View>
                )}
              </View>

              <View className="bg-background-surface rounded-base p-4 gap-3">
                <View className="flex-row items-center justify-between">
                  <Typography weight="medium" className="text-body flex-1">
                    Запрашивать согласие на получение информационно-рекламной
                    рассылки
                  </Typography>
                  <Switch
                    disabled={isSaving}
                    value={requiresMarketingConsent}
                    onChange={handleMarketingConsentToggle}
                  />
                </View>
                <Typography
                  weight="regular"
                  className="text-caption text-neutral-500"
                >
                  Согласие необязательно для клиента. Без него не будут
                  отправляться приглашения на повторный визит и поздравления.
                  Сохраняется в карточке клиента.
                </Typography>
              </View>
            </View>
          </KeyboardAwareScrollView>
        )}
      </ScreenWithToolbar>

      <StModal
        visible={consentInfoVisible}
        onClose={() => setConsentInfoVisible(false)}
        header={
          <IconButton
            size="xs"
            buttonClassName="bg-transparent absolute right-[20px] top-2 z-10"
            onPress={() => setConsentInfoVisible(false)}
            icon={
              <StSvg name="Close_round" size={20} color={colors.neutral[900]} />
            }
          />
        }
        footer={
          <Button
            title="Понятно"
            onPress={() => setConsentInfoVisible(false)}
            variant="primary"
          />
        }
      >
        <View className="mt-3 mb-5">
          <Typography weight="regular" className="text-body">
            Введите текст, с которым клиент будет соглашаться при онлайн-записи.
            Укажите, кто обрабатывает персональные данные - юрлицо, ИП или
            физлицо{" "}
            <Typography weight="medium">
              (например: ООО “Слоттер”, ИП Слоттер Слоттер Слоттеррович или
              ФИО).
            </Typography>{" "}
            Опишите, какие действия выполняются с данными{" "}
            <Typography weight="medium">
              (сбор, хранения, использование и т.д).
            </Typography>{" "}
              Внизу согласия будет автоматически добавлен обязательный абзац -
            оне сообщает клиенту, что данные передаются в{" "}
            <Typography weight="medium">Slotter</Typography> как третьей
            стороны.
          </Typography>
        </View>
      </StModal>
    </FormProvider>
  );
};

export default Booking;
