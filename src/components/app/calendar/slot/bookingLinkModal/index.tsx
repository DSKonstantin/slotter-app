import React, { memo, useState } from "react";
import { View } from "react-native";
import { useForm, FormProvider } from "react-hook-form";
import * as Clipboard from "expo-clipboard";

import {
  StModal,
  Button,
  Typography,
  StSvg,
  SegmentedControl,
} from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import { RHFSelect } from "@/src/components/hookForm/rhf-select";
import { RhfTextField } from "@/src/components/hookForm/rhf-text-field";

type Props = {
  visible: boolean;
  bookingUrl: string;
  onClose: () => void;
};

const CHANNEL_OPTIONS = [{ label: "Чат Slotter", value: "slotter" }];

const BookingLinkModal = ({ visible, bookingUrl, onClose }: Props) => {
  const [channel, setChannel] = useState("slotter");
  const [isCopied, setIsCopied] = useState(false);

  const methods = useForm({
    defaultValues: { client: null, message: "" },
  });

  const handleCopy = async () => {
    await Clipboard.setStringAsync(bookingUrl);
    setIsCopied(true);
  };

  const handleClose = () => {
    methods.reset();
    setChannel("slotter");
    setIsCopied(false);
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
            items={[]}
          />

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
            hideErrorText
          />
          <Typography className="text-caption text-neutral-500">
            Отправим в: WhatsApp
          </Typography>
        </View>

        <View className="mt-6 gap-3">
          <Button
            title="Скопировать ссылку"
            variant="clear"
            onPress={handleCopy}
            rightIcon={
              <StSvg name="Copy" size={24} color={colors.neutral[900]} />
            }
          />
          {isCopied && (
            <Typography className="text-caption text-primary-blue-500 text-center">
              Ссылка скопирована
            </Typography>
          )}
          <Button title="Отправить" onPress={handleClose} />
        </View>
      </FormProvider>
    </StModal>
  );
};

export default memo(BookingLinkModal);
