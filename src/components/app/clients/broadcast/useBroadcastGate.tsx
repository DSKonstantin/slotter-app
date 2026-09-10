import React, { useCallback, useState } from "react";

import { useClientNotificationsConnected } from "@/src/hooks/useClientNotificationsConnected";
import ConnectChannelModal from "./ConnectChannelModal";

type BroadcastGate = {
  guard: (action: () => void) => void;
  isLoading: boolean;
  modal: React.ReactNode;
};

export function useBroadcastGate(): BroadcastGate {
  const [visible, setVisible] = useState(false);

  const { connected, isLoading } = useClientNotificationsConnected();

  const guard = useCallback(
    (action: () => void) => {
      if (isLoading) return;
      if (connected) {
        action();
      } else {
        setVisible(true);
      }
    },
    [connected, isLoading],
  );

  return {
    guard,
    isLoading,
    modal: (
      <ConnectChannelModal
        visible={visible}
        onClose={() => setVisible(false)}
      />
    ),
  };
}
