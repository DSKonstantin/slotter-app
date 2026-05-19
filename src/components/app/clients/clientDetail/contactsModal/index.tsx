import React from "react";
import { Linking, View } from "react-native";
import { toast } from "@backpackapp-io/react-native-toast";
import { StModal, Button, StSvg, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import { formatPhoneDisplay } from "@/src/utils/mask/maskPhone";

type Props = {
  visible: boolean;
  onClose: () => void;
  phone?: string | null;
};

const sanitizePhone = (phone: string) => phone.replace(/[^\d+]/g, "");

const ContactsModal = ({ visible, onClose, phone }: Props) => {
  const cleanPhone = phone ? sanitizePhone(phone) : "";
  const digitsOnly = cleanPhone.replace(/\+/g, "");
  const hasPhone = digitsOnly.length > 0;
  const whatsappUrl = `https://wa.me/${digitsOnly}`;
  const telegramUrl = `tg://resolve?phone=${cleanPhone}`;

  const open = async (url: string, fallback: string) => {
    try {
      await Linking.openURL(url);
      onClose();
    } catch {
      toast.error(fallback);
    }
  };

  const handleCall = () =>
    open(`tel:${cleanPhone}`, "Не удалось открыть звонок");
  const handleWhatsApp = () => open(whatsappUrl, "Не удалось открыть WhatsApp");
  const handleTelegram = () => open(telegramUrl, "Не удалось открыть Telegram");

  return (
    <StModal visible={visible} onClose={onClose}>
      <View className="gap-4">
        <View className="gap-1">
          <Typography weight="semibold" className="text-display text-center">
            Связаться
          </Typography>
          {hasPhone && (
            <Typography className="text-body text-center">
              {formatPhoneDisplay(phone!)}
            </Typography>
          )}
        </View>

        <View className="gap-2">
          <Button
            title="Позвонить"
            onPress={handleCall}
            disabled={!hasPhone}
            buttonClassName="w-full"
            leftIcon={
              <StSvg name="Phone_fill" size={20} color={colors.neutral[0]} />
            }
          />
          <Button
            title="WhatsApp"
            variant="secondary"
            onPress={handleWhatsApp}
            disabled={!hasPhone}
            buttonClassName="w-full"
            leftIcon={
              <StSvg
                name="SocialWhatsApp"
                size={20}
                color={colors.neutral[900]}
              />
            }
          />
          <Button
            title="Telegram"
            variant="secondary"
            onPress={handleTelegram}
            disabled={!hasPhone}
            buttonClassName="w-full"
            leftIcon={
              <StSvg
                name="SocialTelegram"
                size={20}
                color={colors.neutral[900]}
              />
            }
          />
        </View>
      </View>
    </StModal>
  );
};

export default ContactsModal;
