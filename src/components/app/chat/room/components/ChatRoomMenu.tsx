import React, { useState } from "react";
import { View, Pressable } from "react-native";
import {
  Button,
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
  const [isBlocked, setIsBlocked] = useState(false);

  const handleToggleBlock = async () => {
    try {
      if (isBlocked) {
        // await api.post(`/chat_rooms/${roomId}/unblock`);
      } else {
        // await api.post(`/chat_rooms/${roomId}/block`);
      }

      setIsBlocked((prev) => !prev);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <StModal visible={visible} onClose={onClose}>
      <View className="items-center pb-6 gap-1">
        <Avatar name={name} size="md" />
        <Typography weight="semibold" className="text-body">
          {name}
        </Typography>
        {phone && (
          <Typography className="text-caption text-neutral-500">
            {phone}
          </Typography>
        )}
      </View>

      <View className="flex-row gap-4 justify-around mb-6">
        <Pressable
          className="items-center gap-2 active:opacity-70"
          onPress={() => {}}
        >
          <View className="w-14 h-14 rounded-full bg-background-surface items-center justify-center">
            <StSvg name="Phone_fill" size={24} color={colors.neutral[900]} />
          </View>
          <Typography
            weight="regular"
            className="text-caption text-neutral-500"
          >
            Позвонить
          </Typography>
        </Pressable>

        <Pressable
          className="items-center gap-2 active:opacity-70"
          onPress={() => {}}
        >
          <View className="w-14 h-14 rounded-full bg-background-surface items-center justify-center">
            <StSvg
              name="File_dock_search_fill"
              size={24}
              color={colors.neutral[900]}
            />
          </View>
          <Typography
            weight="regular"
            className="text-caption text-neutral-500"
          >
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

      <View className="gap-2">
        <Button
          title={isBlocked ? "Разблокировать" : "Заблокировать"}
          variant="clear"
          textClassName="text-accent-red-500"
          onPress={handleToggleBlock}
          rightIcon={
            <StSvg
              name="Cancel"
              size={20}
              color={isBlocked ? colors.neutral[500] : colors.accent.red[500]}
            />
          }
        />
        <Button
          title="Удалить переписку"
          variant="clear"
          textClassName="text-accent-red-500"
          onPress={() => {}}
          rightIcon={
            <StSvg name="Trash" size={20} color={colors.accent.red[500]} />
          }
        />
      </View>
    </StModal>
  );
};

export default ChatRoomMenu;
