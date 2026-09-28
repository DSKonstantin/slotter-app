import React from "react";
import { StyleSheet, View } from "react-native";
import { AppText } from "@/src/components/ui/AppText";
import { format } from "date-fns";
import type { TimeProps } from "react-native-gifted-chat";
import { MAX_FONT_SCALE } from "@/src/constants/layout";
import type { ChatIMessage } from "@/src/utils/chat/types";

const ChatTime = ({
  position = "left",
  containerStyle,
  currentMessage,
  timeTextStyle,
}: TimeProps<ChatIMessage>) => {
  if (!currentMessage) return null;

  return (
    <View style={containerStyle?.[position]}>
      <AppText
        maxFontSizeMultiplier={MAX_FONT_SCALE}
        style={[
          styles.text,
          position === "right" ? styles.textRight : styles.textLeft,
          timeTextStyle?.[position],
        ]}
      >
        {format(new Date(currentMessage.createdAt), "HH:mm")}
      </AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  text: {
    fontSize: 10,
    textAlign: "right",
  },
  textLeft: {
    color: "#aaa",
  },
  textRight: {
    color: "white",
  },
});

export default ChatTime;
