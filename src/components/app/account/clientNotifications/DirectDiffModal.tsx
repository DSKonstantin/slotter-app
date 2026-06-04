import React from "react";
import { View } from "react-native";
import { Button, Divider, StModal, Typography } from "@/src/components/ui";

type Props = {
  visible: boolean;
  onClose: () => void;
};

const ROWS = [
  {
    label: "Действие клиента",
    free: "Да",
    direct: "Нет",
    directClassName: "text-primary-blue-500",
  },
  {
    label: "Охват базы",
    free: "Частичный",
    direct: "100%",
    directClassName: "text-primary-blue-500",
  },
  {
    label: "От чьего имени",
    free: "Бот /\nприложение",
    direct: "От вас",
    directClassName: "text-primary-blue-500",
  },
  {
    label: "Стоимость",
    free: "Бесплатно",
    direct: "1 000 ₽/мес",
    directClassName: "text-neutral-900",
  },
];

const DirectDiffModal = ({ visible, onClose }: Props) => (
  <StModal
    visible={visible}
    onClose={onClose}
    footer={<Button title="Понятно" onPress={onClose} variant="primary" />}
  >
    <View className="mb-5">
      <Typography weight="semibold" className="text-display text-center">
        Прямые уведомления
      </Typography>
      <Typography
        weight="regular"
        className="text-body text-center text-neutral-500"
      >
        Клиент получает сообщение от вашего имени — без подписок и установок
      </Typography>
    </View>

    <View className="bg-background-surface p-4 rounded-base mb-5">
      <View className="flex-row">
        <View className="flex-1" />
        <Typography
          weight="medium"
          className="flex-1 text-caption text-neutral-500 text-center"
        >
          Бесплатные
        </Typography>
        <Typography
          weight="medium"
          className="flex-1 text-caption text-primary-blue-500 text-center"
        >
          Прямые
        </Typography>
      </View>
      <Divider className="my-3" />

      {ROWS.map(({ label, free, direct, directClassName }, i) => (
        <React.Fragment key={label}>
          {i > 0 && <Divider className="my-3" />}
          <View className="flex-row items-center">
            <Typography
              weight="regular"
              className="flex-1 text-caption text-neutral-900"
            >
              {label}
            </Typography>
            <Typography
              weight="regular"
              className="flex-1 text-caption text-neutral-500 text-center"
            >
              {free}
            </Typography>
            <Typography
              className={`flex-1 text-caption text-center ${directClassName}`}
            >
              {direct}
            </Typography>
          </View>
        </React.Fragment>
      ))}
    </View>
  </StModal>
);

export default DirectDiffModal;
