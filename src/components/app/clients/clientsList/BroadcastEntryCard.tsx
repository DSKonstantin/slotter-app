import React from "react";
import { router } from "expo-router";

import { Routers } from "@/src/constants/routers";
import ClientsHeaderCard from "./ClientsHeaderCard";

type Props = {
  disabled?: boolean;
};

const BroadcastEntryCard = ({ disabled }: Props) => {
  return (
    <ClientsHeaderCard
      iconName="Message_alt_fill"
      label="Рассылка"
      badge="New"
      disabled={disabled}
      onPress={() => router.push(Routers.app.broadcast.root)}
    />
  );
};

export default BroadcastEntryCard;
