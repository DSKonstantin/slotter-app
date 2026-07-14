import React from "react";
import { useLocalSearchParams } from "expo-router";
import TelegramDirectAuth from "./TelegramDirectAuth";
import MaxDirectAuth from "./MaxDirectAuth";

type Channel = "telegram" | "max";

const DirectAuthScreen = () => {
  const { channel } = useLocalSearchParams<{ channel: Channel }>();
  return channel === "max" ? <MaxDirectAuth /> : <TelegramDirectAuth />;
};

export default DirectAuthScreen;
