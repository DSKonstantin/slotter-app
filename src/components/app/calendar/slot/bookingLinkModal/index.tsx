import React, { memo, useMemo, useState } from "react";
import { View } from "react-native";
import { useForm, FormProvider } from "react-hook-form";

import {
  StModal,
  Button,
  Typography,
  SegmentedControl,
} from "@/src/components/ui";
import { CopyLinkButton } from "@/src/components/shared/copyLinkButton";
import RetryInline from "@/src/components/shared/retryInline";
import { RHFSelect } from "@/src/components/hookForm/rhf-select";
import { RhfTextField } from "@/src/components/hookForm/rhf-text-field";
import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";
import { useGetCustomersQuery } from "@/src/store/redux/services/api/customersApi";
import { colors } from "@/src/styles/colors";

type Props = {
  visible: boolean;
  bookingUrl: string;
  onClose: () => void;
};

const CHANNEL_OPTIONS = [
  { label: "Чат Slotter", value: "slotter" },
  { label: "Чат Telegram", value: "telegram" },
];

const BookingLinkModal = ({ visible, bookingUrl, onClose }: Props) => {
  const auth = useRequiredAuth();
  const [channel, setChannel] = useState("slotter");

  const methods = useForm({
    defaultValues: { client: null, message: "" },
  });

  const { data, isLoading, isError, refetch } = useGetCustomersQuery(
    auth ? { userId: auth.userId, items: 100 } : { userId: 0 },
    { skip: !visible || !auth },
  );

  const clientItems = useMemo(
    () =>
      (data?.customers ?? []).map((c) => ({
        label: c.phone ? `${c.name} · ${c.phone}` : c.name,
        value: String(c.id),
      })),
    [data],
  );

  const fullBookingUrl = useMemo(
    () => `${process.env.EXPO_PUBLIC_BOOKING_BASE_URL}/${bookingUrl}`,
    [bookingUrl],
  );

  const handleClose = () => {
    methods.reset();
    setChannel("slotter");
    onClose();
  };

  return (
    <StModal visible={visible} onClose={handleClose} keyboardAware={true}>
      <FormProvider {...methods}>
        <Typography weight="semibold" className="text-display text-center mb-5">
          Ссылка на бронирование
        </Typography>

        <View className="gap-3">
          <RHFSelect
            name="client"
            label="Клиент"
            placeholder="Кому отправляем"
            items={clientItems}
            emptyText={isLoading ? "Загрузка..." : "Нет клиентов"}
          />
          {isError && (
            <RetryInline
              text="Не удалось загрузить клиентов"
              onRetry={refetch}
            />
          )}

          <SegmentedControl
            options={CHANNEL_OPTIONS}
            value={channel}
            onChange={setChannel}
          />

          <RhfTextField
            name="message"
            label="Сообщение"
            placeholder="Добавьте сообщение к ссылке..."
            multiline
            numberOfLines={4}
            hideErrorText
          />
          <Typography className="text-caption text-neutral-500">
            Отправим в:{" "}
            {CHANNEL_OPTIONS.find((o) => o.value === channel)?.label}
          </Typography>
        </View>

        <View className="mt-6 gap-3">
          <CopyLinkButton
            link={fullBookingUrl}
            displayLink="Скопировать ссылку"
            className="border-0 rounded-none bg-transparent"
            textClassName="text-gray-900"
            iconColor={colors.neutral[900]}
          />
          <Button title="Отправить" onPress={handleClose} />
        </View>
      </FormProvider>
    </StModal>
  );
};

export default memo(BookingLinkModal);
