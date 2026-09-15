import React from "react";
import { router, type Href } from "expo-router";

import { Routers } from "@/src/constants/routers";
import { useBroadcastGate } from "@/src/components/app/clients/broadcast/useBroadcastGate";
import ClientsHeaderCard from "./ClientsHeaderCard";

type Props = {
  disabled?: boolean;
  route?: Href;
};

const BroadcastEntryCard = ({
  disabled,
  route = Routers.app.clients.broadcast,
}: Props) => {
  const { guard, isLoading, modal } = useBroadcastGate();

  return (
    <>
      <ClientsHeaderCard
        iconName="Message_alt_fill"
        label="Рассылка"
        disabled={disabled || isLoading}
        onPress={() => guard(() => router.push(route))}
      />
      {modal}
    </>
  );
};

export default BroadcastEntryCard;
