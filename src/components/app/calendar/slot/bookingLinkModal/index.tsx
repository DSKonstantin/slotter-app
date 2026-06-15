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
import { RhfTextField } from "@/src/components/hookForm/rhf-text-field";
import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";
import CustomerSelectField from "@/src/components/shared/fields/customerSelectField";
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
  customerId: number;
  message: string;
};

const CHANNEL_OPTIONS = [
  { label: "Slotter", value: "slotter" },
  { label: "WhatsApp", value: "whatsapp" },
  { label: "Telegram", value: "telegram" },
];

const BookingLinkModal = ({ visible, bookingUrl, onClose }: Props) => {
  const auth = useRequiredAuth();
  const [channel, setChannel] = useState("slotter");

  const methods = useForm<FormValues>({
    defaultValues: { customerId: 0, message: "" },
  });

  const [createChatRoom] = useCreateChatRoomMutation();
  const [sendMessage, { isLoading: isSending }] = useSendMessageMutation();

  const fullBookingUrl = useMemo(
    () => `${process.env.EXPO_PUBLIC_BOOKING_BASE_URL}/${bookingUrl}`,
    [bookingUrl],
  );

  const channelLabel = useMemo(
    () => CHANNEL_OPTIONS.find((o) => o.value === channel)?.label ?? "",
    [channel],
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
      const params = new URLSearchParams({ url: fullBookingUrl });
      if (values.message) params.set("text", values.message);
      const shareUrl = `https://t.me/share/url?${params.toString()}`;
      try {
        const canOpen = await Linking.canOpenURL(shareUrl);
        if (!canOpen) {
          toast.error("Telegram не установлен");
          return;
        }
        await Linking.openURL(shareUrl);
        handleClose();
      } catch (error) {
        toast.error(getApiErrorMessage(error, "Не удалось открыть Telegram"));
      }
      return;
    }

    if (channel === "whatsapp") {
      const shareUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
      try {
        const canOpen = await Linking.canOpenURL(shareUrl);
        if (!canOpen) {
          toast.error("WhatsApp не установлен");
          return;
        }
        await Linking.openURL(shareUrl);
        handleClose();
      } catch (error) {
        toast.error(getApiErrorMessage(error, "Не удалось открыть WhatsApp"));
      }
      return;
    }

    if (!values.customerId) {
      methods.setError("customerId", { message: "Выберите клиента" });
      return;
    }

    try {
      const room = await createChatRoom({
        userId: auth!.userId,
        customerId: values.customerId,
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
            <CustomerSelectField showCreateButton={false} />
          )}

          <RhfTextField
            name="message"
            label="Сообщение"
            placeholder="Добавьте сообщение к ссылке..."
            multiline
            numberOfLines={4}
            hideErrorText
          />

          <Typography className="text-caption text-neutral-500">
            Отправим в: {channelLabel}
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
