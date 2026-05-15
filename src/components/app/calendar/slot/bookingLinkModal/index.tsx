import React, { memo, useMemo, useState } from "react";
import { Linking, View } from "react-native";
import { useForm, FormProvider } from "react-hook-form";
import { toast } from "@backpackapp-io/react-native-toast";

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
import { useGetUserCustomersQuery } from "@/src/store/redux/services/api/userCustomersApi";
import { useCreateChatRoomMutation } from "@/src/store/redux/services/api/chatRoomsApi";
import { useSendMessageMutation } from "@/src/store/redux/services/api/chatMessagesApi";
import { getApiErrorMessage } from "@/src/utils/apiError";
import { colors } from "@/src/styles/colors";

type Props = {
  visible: boolean;
  bookingUrl: string;
  onClose: () => void;
};

type FormValues = {
  client: string | null;
  message: string;
};

const CHANNEL_OPTIONS = [
  { label: "Чат Slotter", value: "slotter" },
  { label: "Чат Telegram", value: "telegram" },
];

const BookingLinkModal = ({ visible, bookingUrl, onClose }: Props) => {
  const auth = useRequiredAuth();
  const [channel, setChannel] = useState("slotter");

  const methods = useForm<FormValues>({
    defaultValues: { client: null, message: "" },
  });

  const { data, isLoading, isError, refetch } = useGetUserCustomersQuery(
    auth ? { userId: auth.userId, per_count: 100 } : { userId: 0 },
    { skip: !visible || !auth },
  );

  const [createChatRoom] = useCreateChatRoomMutation();
  const [sendMessage, { isLoading: isSending }] = useSendMessageMutation();

  const clientItems = useMemo(
    () =>
      (data?.user_customers ?? []).map((uc) => ({
        label: uc.customer.phone
          ? `${uc.customer.name} · ${uc.customer.phone}`
          : uc.customer.name,
        value: String(uc.customer.id),
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

  const handleSend = methods.handleSubmit(async (values) => {
    const text = values.message
      ? `${values.message}\n\n${fullBookingUrl}`
      : fullBookingUrl;

    if (channel === "telegram") {
      // const url = `https://t.me/share/url?url=${encodeURIComponent(fullBookingUrl)}${values.message ? `&text=${encodeURIComponent(values.message)}` : ""}`;
      // await Linking.openURL(url);
      handleClose();
      return;
    }

    if (!values.client) {
      methods.setError("client", { message: "Выберите клиента" });
      return;
    }

    try {
      const room = await createChatRoom({
        userId: auth!.userId,
        customerId: Number(values.client),
      }).unwrap();
      await sendMessage({ chatRoomId: room.id, body: text }).unwrap();
      toast.success("Ссылка отправлена");
      handleClose();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Не удалось отправить"));
    }
  });

  return (
    <StModal visible={visible} onClose={handleClose} keyboardAware={true}>
      <FormProvider {...methods}>
        <Typography weight="semibold" className="text-display text-center mb-5">
          Ссылка на бронирование
        </Typography>

        <View className="gap-3">
          <SegmentedControl
            options={CHANNEL_OPTIONS}
            value={channel}
            onChange={setChannel}
          />

          {channel === "slotter" && (
            <>
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
            </>
          )}

          <RhfTextField
            name="message"
            label="Сообщение"
            placeholder="Добавьте сообщение к ссылке..."
            multiline
            numberOfLines={4}
            hideErrorText
          />
        </View>

        <View className="mt-6 gap-3">
          <CopyLinkButton
            link={fullBookingUrl}
            displayLink="Скопировать ссылку"
            className="border-0 rounded-none bg-transparent"
            textClassName="text-gray-900"
            iconColor={colors.neutral[900]}
          />
          <Button
            title="Отправить"
            loading={isSending}
            disabled={isSending}
            onPress={handleSend}
          />
        </View>
      </FormProvider>
    </StModal>
  );
};

export default memo(BookingLinkModal);
