import React, { useState } from "react";
import { View } from "react-native";
import { router } from "expo-router";
import { Routers } from "@/src/constants/routers";
import { StModal, StSvg, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import CreateActionCard from "@/src/components/shared/cards/createActionCard";
import { useAppDispatch } from "@/src/store/redux/store";
import { clearSlotDraft } from "@/src/store/redux/slices/slotDraftSlice";
import ComingSoonModal from "@/src/components/shared/modals/ComingSoonModal";
import { useModalAction } from "@/src/hooks/useModalAction";

type Props = {
  visible: boolean;
  onClose: () => void;
};

const CreateActionModal = ({ visible, onClose }: Props) => {
  const [comingSoonVisible, setComingSoonVisible] = useState(false);
  const dispatch = useAppDispatch();
  const { scheduleAction, onModalHide } = useModalAction(onClose);

  const actions = [
    {
      icon: "Calendar_add_fill",
      title: "Слот",
      subtitle: "Создать новую запись",
      onPress: () => {
        scheduleAction(() => {
          dispatch(clearSlotDraft());
          router.push(Routers.app.createSlotFlow.selectService());
        });
      },
    },
    {
      icon: "User_add_alt_fill",
      title: "Клиента",
      subtitle: "Добавить в базу",
      onPress: () => {
        scheduleAction(() => router.push(Routers.app.createClient));
      },
    },
    {
      icon: "Money_fill",
      title: "Оплату",
      subtitle: "Наличный или безналичный расчет",
      className: "opacity-40",
      onPress: () => {
        scheduleAction(() => setComingSoonVisible(true));
      },
    },
  ];

  return (
    <>
      <StModal visible={visible} onClose={onClose} onModalHide={onModalHide}>
        <Typography weight="semibold" className="text-display text-center mb-4">
          Создать
        </Typography>
        <View className="gap-2">
          {actions.map((action) => (
            <CreateActionCard
              key={action.title}
              title={action.title}
              className={action.className}
              subtitle={action.subtitle}
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

      <ComingSoonModal
        visible={comingSoonVisible}
        onClose={() => setComingSoonVisible(false)}
      />
    </>
  );
};

export default CreateActionModal;
