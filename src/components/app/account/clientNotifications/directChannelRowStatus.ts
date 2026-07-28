import type {
  DirectChannelKind,
  SubscriptionDirectChannel,
} from "@/src/store/redux/services/api-types";
import { isDirectChannelActive } from "@/src/utils/directChannel";
import { colors } from "@/src/styles/colors";

export type DirectChannelRowStatus = {
  label: string;
  iconName: string;
  color: string;
  /** путь внутри /personal-account/{userId} на вебе, "" — корень кабинета */
  webPath: string;
  /** true — акцентный стиль действия (как у «Подключить») */
  emphasized?: boolean;
};

// Правый лейбл строки канала и переход на веб по паре
// status/provisioning_status — та же таблица статусов, что в personal-account
// (PAID_NOTIFICATIONS §9.3).
export function getDirectChannelRowStatus(
  channel: SubscriptionDirectChannel | undefined,
  kind: DirectChannelKind,
): DirectChannelRowStatus {
  const checkoutPath = `/notifications/${kind}`;

  if (!channel) {
    return {
      label: "Подключить",
      iconName: "Add_round",
      color: colors.primary.blue[500],
      webPath: checkoutPath,
      emphasized: true,
    };
  }
  if (isDirectChannelActive(channel)) {
    return {
      label: "Управлять",
      iconName: "Setting_alt_fill",
      color: colors.neutral[900],
      webPath: `${checkoutPath}`,
    };
  }
  if (channel.status === "pending") {
    return {
      label: "Оплата не завершена",
      iconName: "Refresh_2",
      color: colors.accent.orange[500],
      webPath: checkoutPath,
    };
  }
  if (channel.status === "grace") {
    return {
      label: "Требуется оплата",
      iconName: "Alarm_fill",
      color: colors.accent.red[500],
      // ручной выход из grace — обычный checkout: бэк сбрасывает канал
      // в pending и создаёт новый initial-платёж (initiate_checkout.rb)
      webPath: checkoutPath,
    };
  }
  if (channel.provisioning_status === "awaiting_auth") {
    return {
      label: "Ожидает привязки",
      iconName: "Time_fill",
      color: colors.accent.orange[500],
      webPath: `${checkoutPath}`,
    };
  }
  // paid и т.п., канал поднимается на стороне бэка (none → … → connecting)
  return {
    label: "Настраиваем канал…",
    iconName: "Setting_alt_fill",
    color: colors.accent.orange[500],
    webPath: `${checkoutPath}`,
  };
}
