import React from "react";
import { router } from "expo-router";

import { Routers } from "@/src/constants/routers";
import { useBroadcastGate } from "@/src/components/app/clients/broadcast/useBroadcastGate";
import ClientsHeaderCard from "./ClientsHeaderCard";

type Props = {
  disabled?: boolean;
};

const BroadcastEntryCard = ({ disabled }: Props) => {
  const { guard, isLoading, modal } = useBroadcastGate();

  return (
    <>
      <ClientsHeaderCard
        iconName="Message_alt_fill"
        label="Рассылка"
        disabled={disabled || isLoading}
        onPress={() => guard(() => router.push(Routers.app.clients.broadcast))}
      />
      {modal}
    </>
  );
};

export default BroadcastEntryCard;
