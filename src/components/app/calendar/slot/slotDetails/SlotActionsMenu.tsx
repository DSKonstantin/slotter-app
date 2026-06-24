import React from "react";
import { View } from "react-native";
import Popover from "react-native-popover-view";
import { Button, Divider, IconButton, StSvg } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import type { AppointmentStatus } from "@/src/store/redux/services/api-types/appointment";

interface Props {
  status: AppointmentStatus;
  visible: boolean;
  onOpen: () => void;
  onClose: () => void;
  onCloseComplete: () => void;
  onReschedule: () => void;
  onCancel: () => void;
  onChangeCustomer?: () => void;
}

const SlotActionsMenu: React.FC<Props> = ({
  status,
  visible,
  onOpen,
  onClose,
  onCloseComplete,
  onReschedule,
  onCancel,
  onChangeCustomer,
}) => (
  <Popover
    isVisible={visible}
    onRequestClose={onClose}
    onCloseComplete={onCloseComplete}
    popoverStyle={{ borderRadius: 24, overflow: "hidden" }}
    arrowSize={{ width: 0, height: 0 }}
    animationConfig={{ duration: 0 }}
    offset={4}
    from={
      <IconButton
        size="md"
        onPress={onOpen}
        icon={
          <StSvg name="Meatballs_menu" size={24} color={colors.neutral[900]} />
        }
      />
    }
  >
    <View className="p-2 gap-1 min-w-[180px]">
      {(status === "pending" || status === "confirmed") && (
        <>
          <Button
            title="Перенести"
            variant="clear"
            buttonClassName="justify-start"
            onPress={onReschedule}
            rightIcon={
              <StSvg
                name="Refund_Forward"
                size={24}
                color={colors.neutral[900]}
              />
            }
          />
          {onChangeCustomer && (
            <>
              <Divider />
              <Button
                title="Изменить клиента"
                variant="clear"
                buttonClassName="justify-start"
                onPress={onChangeCustomer}
                rightIcon={
                  <StSvg
                    name="User_fill"
                    size={24}
                    color={colors.neutral[900]}
                  />
                }
              />
            </>
          )}
          <Divider />
        </>
      )}

      {(status === "pending" ||
        status === "confirmed" ||
        status === "proposed") && (
        <Button
          title="Отменить запись"
          variant="clear"
          buttonClassName="justify-start"
          textClassName="text-accent-red-500"
          onPress={onCancel}
          rightIcon={
            <StSvg name="Dell_fill" size={24} color={colors.accent.red[500]} />
          }
        />
      )}
    </View>
  </Popover>
);

export default SlotActionsMenu;
