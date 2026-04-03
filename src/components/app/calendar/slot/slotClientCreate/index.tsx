import React, { useCallback } from "react";
import ClientCreate from "@/src/components/app/clients/clientCreate";
import { useAppDispatch } from "@/src/store/redux/store";
import { setCreatedCustomer } from "@/src/store/redux/slices/slotDraftSlice";
import type { Customer } from "@/src/store/redux/services/api-types";

const SlotClientCreate: React.FC = () => {
  const dispatch = useAppDispatch();

  const handleCreated = useCallback(
    (customer: Customer) => {
      dispatch(setCreatedCustomer({ id: customer.id, name: customer.name }));
    },
    [dispatch],
  );

  return <ClientCreate onCreated={handleCreated} />;
};

export default SlotClientCreate;
