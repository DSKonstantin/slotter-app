import React, { useCallback, useState } from "react";
import { AccountDeactivatedModal } from "@/src/components/auth/verify/AccountDeactivatedModal";

export const useAccountDeactivatedModal = () => {
  const [visible, setVisible] = useState(false);

  const show = useCallback(() => setVisible(true), []);
  const hide = useCallback(() => setVisible(false), []);

  return {
    show,
    modal: <AccountDeactivatedModal visible={visible} onClose={hide} />,
  };
};
