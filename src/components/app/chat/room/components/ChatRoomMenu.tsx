import React, { useState } from "react";
import { View, Pressable } from "react-native";
import {
  Avatar,
  Divider,
  StModal,
  StSvg,
  Switch,
  Typography,
} from "@/src/components/ui";
import { colors } from "@/src/styles/colors";

type Props = {
  visible: boolean;
  onClose: () => void;
  name: string;
  phone?: string;
};

const ChatRoomMenu = ({ visible, onClose, name, phone }: Props) => {
  const [notifications, setNotifications] = useState(true);

  return (
    <StModal visible={visible} onClose={onClose}>
      <View className="items-center pt-2 pb-6 gap-1">
        <Avatar name={name} size="lg" />
        <Typography weight="semibold" className="text-[17px] mt-3">
          {name}
        </Typography>
        {phone && (
          <Typography className="text-[13px] text-neutral-400">
            {phone}
          </Typography>
        )}
      </View>

      <View className="flex-row gap-4 justify-center mb-6">
        <Pressable
          className="items-center gap-2 active:opacity-70"
          onPress={() => {}}
        >
          <View className="w-14 h-14 rounded-2xl bg-neutral-100 items-center justify-center">
            <StSvg name="Phone_fill" size={24} color={colors.neutral[700]} />
          </View>
          <Typography className="text-[12px] text-neutral-500">
            Позвонить
          </Typography>
        </Pressable>

        <Pressable
          className="items-center gap-2 active:opacity-70"
          onPress={() => {}}
        >
          <View className="w-14 h-14 rounded-2xl bg-neutral-100 items-center justify-center">
            <StSvg
              name="File_dock_search_fill"
              size={24}
              color={colors.neutral[700]}
            />
          </View>
          <Typography className="text-[12px] text-neutral-500">
            История записей
          </Typography>
        </Pressable>
      </View>

      <View className="rounded-2xl bg-white border border-background overflow-hidden mb-4">
        <View className="flex-row items-center justify-between px-4 min-h-[56px]">
          <Typography className="text-body">Уведомления</Typography>
          <Switch value={notifications} onChange={setNotifications} />
        </View>
      </View>

      <View className="rounded-2xl bg-white border border-background overflow-hidden gap-0">
        <Pressable
          className="flex-row items-center justify-center gap-2 min-h-[56px] active:opacity-70"
          onPress={() => {}}
        >
          <Typography className="text-[15px] text-red-500">
            Заблокировать
          </Typography>
          <StSvg
            name="Close_round_fill_light"
            size={20}
            color={colors.accent.red[500]}
          />
        </Pressable>

        <Divider />

        <Pressable
          className="flex-row items-center justify-center gap-2 min-h-[56px] active:opacity-70"
          onPress={() => {}}
        >
          <Typography className="text-[15px] text-red-500">
            Удалить переписку
          </Typography>
          <StSvg name="Trash_light" size={20} color={colors.accent.red[500]} />
        </Pressable>
      </View>
    </StModal>
  );
};

export default ChatRoomMenu;
