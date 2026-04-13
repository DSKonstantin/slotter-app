import React, { useCallback, useState } from "react";
import { GiftedChat, IMessage } from "react-native-gifted-chat";
import { SafeAreaView } from "react-native-safe-area-context";
import { View } from "react-native";
import ScreenWithToolbar from "@/src/components/shared/layout/screenWithToolbar";
import { Avatar, IconButton, StSvg, Typography } from "@/src/components/ui";
import { MOCK_MESSAGES, MOCK_OTHER, MOCK_USER } from "./mock";
import ChatBubble from "./components/ChatBubble";
import ChatInputToolbar from "./components/ChatInputToolbar";
import ChatSendButton from "./components/ChatSendButton";
import ChatRoomMenu from "./components/ChatRoomMenu";
import { colors } from "@/src/styles/colors";

type Props = {
  roomId: string;
};

const ChatRoom = ({ roomId: _roomId }: Props) => {
  const [messages, setMessages] = useState<IMessage[]>(MOCK_MESSAGES);
  const [menuVisible, setMenuVisible] = useState(false);
  const onSend = useCallback((newMessages: IMessage[] = []) => {
    setMessages((prev) => GiftedChat.append(prev, newMessages));
  }, []);

  const titleNode = (
    <View className="flex-row items-center gap-2">
      <Avatar name={MOCK_OTHER.name} size="xs" />
      <Typography weight="semibold" className="text-[17px] leading-[22px]">
        {MOCK_OTHER.name}
      </Typography>
    </View>
  );

  return (
    <>
      <ScreenWithToolbar
        title={titleNode}
        rightButton={
          <IconButton
            icon={
              <StSvg
                name="Meatballs_menu"
                size={28}
                color={colors.neutral[900]}
              />
            }
            onPress={() => setMenuVisible(true)}
          />
        }
      >
        {({ topInset }) => (
          <SafeAreaView className="flex-1" edges={["left", "right", "bottom"]}>
            <GiftedChat
              messages={messages}
              onSend={onSend}
              user={MOCK_USER}
              locale="ru"
              isSendButtonAlwaysVisible
              textInputProps={{ placeholder: "Сообщение..." }}
              renderBubble={(props) => <ChatBubble {...props} />}
              renderInputToolbar={(props) => <ChatInputToolbar {...props} />}
              renderSend={(props) => <ChatSendButton {...props} />}
              messagesContainerStyle={{
                backgroundColor: colors.background.DEFAULT,
              }}
              listProps={{
                contentContainerStyle: {
                  paddingBottom: topInset,
                  // paddingHorizontal: 20,
                },
              }}
            />
          </SafeAreaView>
        )}
      </ScreenWithToolbar>
      <ChatRoomMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        name={MOCK_OTHER.name}
        phone="+7 999 123-45-67"
      />
    </>
  );
};

export default ChatRoom;
