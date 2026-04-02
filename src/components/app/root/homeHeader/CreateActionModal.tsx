import React from "react";
import { View } from "react-native";
import { router } from "expo-router";
import { Routers } from "@/src/constants/routers";
import { StModal, StSvg, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import CreateActionCard from "@/src/components/shared/cards/createActionCard";
import { useAppDispatch } from "@/src/store/redux/store";
import { clearSlotDraft } from "@/src/store/redux/slices/slotDraftSlice";

type Props = {
  visible: boolean;
  onClose: () => void;
};

const CreateActionModal = ({ visible, onClose }: Props) => {
  const dispatch = useAppDispatch();

  const actions = [
    {
      icon: "Calendar_add_fill",
      title: "Слот",
      subtitle: "Создать новую запись",
      onPress: () => {
        onClose();
        dispatch(clearSlotDraft());
        router.push(Routers.app.calendar.slotCreate());
      },
    },
    {
      icon: "User_add_alt_fill",
      title: "Клиента",
      subtitle: "Добавить в базу",
      onPress: () => {
        onClose();
        router.push(Routers.app.clients.create);
      },
    },
    {
      icon: "link_alt",
      title: "Поделится свободными слотами",
      subtitle: "Удобно добавить в Stories или переслать",
      disabled: true,
      onPress: () => {
        onClose();
      },
    },
  ];

  return (
    <StModal visible={visible} onClose={onClose}>
      <Typography weight="semibold" className="text-display text-center mb-4">
        Создать
      </Typography>
      <View className="gap-2">
        {actions.map((action) => (
          <CreateActionCard
            key={action.title}
            title={action.title}
            subtitle={action.subtitle}
            disabled={action.disabled}
            onPress={action.onPress}
            leftIcon={
              <StSvg
                name={action.icon as string}
                size={24}
                color={colors.neutral[900]}
              />
            }
          />
        ))}
      </View>
    </StModal>
  );
};

export default CreateActionModal;
