import React from "react";
import { useLocalSearchParams } from "expo-router";
import ChatRoom from "@/src/components/app/chat/room";

const ChatRoomScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();

  return <ChatRoom roomId={id} />;
};

export default ChatRoomScreen;
