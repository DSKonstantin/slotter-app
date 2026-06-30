import React, { useEffect, useState } from "react";
import { View } from "react-native";
import {
  Badge,
  Button,
  Card,
  Radio,
  StModal,
  Typography,
} from "@/src/components/ui";
import { STATUS_CONFIG } from "./constants";
import type { Appointment } from "@/src/store/redux/services/api-types";

interface Props {
  visible: boolean;
  currentStatus: Appointment["status"];
  isUpdating: boolean;
  onClose: () => void;
  onSelect: (status: Appointment["status"]) => void;
}

const StatusModal: React.FC<Props> = ({
  visible,
  currentStatus,
  isUpdating,
  onClose,
  onSelect,
}) => {
  const [selectedStatus, setSelectedStatus] =
    useState<Appointment["status"]>(currentStatus);

  useEffect(() => {
    if (visible) setSelectedStatus(currentStatus);
  }, [visible, currentStatus]);

  return (
    <StModal visible={visible} onClose={onClose}>
      <Typography weight="semibold" className="text-display text-center mb-4">
        Изменить статус записи
      </Typography>
      <View className="gap-2 mb-4">
        {(["pending", "arrived", "missed"] as const).map((s) => {
          const config = STATUS_CONFIG[s];
          return (
            <Card
              key={config.status}
              titleNode={
                <View className="flex-row items-center gap-2">
                  <Badge
                    size="sm"
                    title={config.label}
                    variant={config.variant}
                    icon={config.icon}
                  />
                  {config.status === currentStatus && (
                    <Typography
                      weight="regular"
                      className="text-neutral-500 text-caption"
                    >
                      Текущий
                    </Typography>
                  )}
                </View>
              }
              onPress={() => setSelectedStatus(config.status)}
              right={
                <Radio
                  value={selectedStatus === config.status}
                  onChange={() => setSelectedStatus(config.status)}
                />
              }
            />
          );
        })}
      </View>
      <Button
        title="Сохранить"
        loading={isUpdating}
        disabled={selectedStatus === currentStatus || isUpdating}
        onPress={() => onSelect(selectedStatus)}
      />
    </StModal>
  );
};

export default StatusModal;
