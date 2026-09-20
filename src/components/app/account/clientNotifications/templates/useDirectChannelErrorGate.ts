import { useCallback, useState } from "react";
import { isDirectChannelRequired } from "@/src/utils/apiError";

export function useDirectChannelErrorGate() {
  const [channelModalVisible, setChannelModalVisible] = useState(false);

  const guardDirectChannelError = useCallback(
    (e: unknown, onOtherError: (e: unknown) => void) => {
      if (isDirectChannelRequired(e)) {
        setChannelModalVisible(true);
        return;
      }
      onOtherError(e);
    },
    [],
  );

  return {
    channelModalVisible,
    setChannelModalVisible,
    guardDirectChannelError,
  };
}
