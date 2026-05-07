import React from "react";
import TagPickerModal from "@/src/components/app/clients/clientCreate/tagPickerModal";
import { useUpdateUserCustomerMutation } from "@/src/store/redux/services/api/userCustomersApi";
import type { CustomerTag } from "@/src/store/redux/services/api-types";

type Props = {
  visible: boolean;
  onClose: () => void;
  userId: number;
  userCustomerId: number;
  currentTag: CustomerTag | null;
};

const ChangeCategoryModal = ({
  visible,
  onClose,
  userId,
  userCustomerId,
  currentTag,
}: Props) => {
  const [updateUserCustomer] = useUpdateUserCustomerMutation();

  const handleSelect = async (tag: CustomerTag | null) => {
    await updateUserCustomer({
      userId,
      id: userCustomerId,
      body: { customer_tag_id: tag?.id ?? null },
    });
    onClose();
  };

  return (
    <TagPickerModal
      visible={visible}
      userId={userId}
      selectedTagId={currentTag?.id ?? null}
      onClose={onClose}
      onSelect={handleSelect}
    />
  );
};

export default ChangeCategoryModal;
