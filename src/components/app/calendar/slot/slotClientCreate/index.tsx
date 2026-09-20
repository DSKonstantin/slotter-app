import React, { useCallback } from "react";
import ClientCreate from "@/src/components/app/clients/clientCreate";
import { useAppDispatch } from "@/src/store/redux/store";
import { setCreatedCustomer } from "@/src/store/redux/slices/slotDraftSlice";
import type { UserCustomer } from "@/src/store/redux/services/api-types";

type Props = {
  initialName?: string;
};

const SlotClientCreate: React.FC<Props> = ({ initialName }) => {
  const dispatch = useAppDispatch();

  const handleCreated = useCallback(
    (userCustomer: UserCustomer) => {
      dispatch(
        setCreatedCustomer({
          id: userCustomer.customer.id,
          name: userCustomer.customer.name,
        }),
      );
    },
    [dispatch],
  );

  return <ClientCreate initialName={initialName} onCreated={handleCreated} />;
};

export default SlotClientCreate;
