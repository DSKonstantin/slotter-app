import React from "react";
import { useLocalSearchParams } from "expo-router";
import ChatRoom from "@/src/components/app/chat/room";

const ChatRoomScreen = () => {
  const { id, backTo } = useLocalSearchParams<{ id: string; backTo?: string }>();

  return <ChatRoom roomId={id} backTo={backTo} />;
};

export default ChatRoomScreen;
