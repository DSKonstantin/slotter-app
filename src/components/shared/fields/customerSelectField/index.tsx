import React, { useCallback, useEffect, useState } from "react";
import { View } from "react-native";
import { router } from "expo-router";
import { useFormContext } from "react-hook-form";

import { IconButton, StSvg } from "@/src/components/ui";
import { RhfPressableField } from "@/src/components/hookForm/rhf-pressable-field";
import { colors } from "@/src/styles/colors";
import { Routers } from "@/src/constants/routers";
import { useAppDispatch, useAppSelector } from "@/src/store/redux/store";
import {
  clearCreatedCustomer,
  clearSelectedCustomer,
} from "@/src/store/redux/slices/slotDraftSlice";
import CustomerPickerModal, {
  type CustomerOption,
} from "@/src/components/shared/modals/CustomerPickerModal";

type Props = {
  showCreateButton?: boolean;
};

const CustomerSelectField = ({ showCreateButton = true }: Props) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCustomer, setSelectedCustomer] =
    useState<CustomerOption | null>(null);

  const dispatch = useAppDispatch();
  const createdCustomer = useAppSelector((s) => s.slotDraft.createdCustomer);
  const selectedCustomerFromDraft = useAppSelector(
    (s) => s.slotDraft.selectedCustomer,
  );
  const { setValue } = useFormContext();

  const handleSelect = useCallback(
    (customer: CustomerOption) => {
      setSelectedCustomer(customer);
      setValue("customerId", customer.id, {
        shouldDirty: true,
        shouldValidate: true,
      });
    },
    [setValue],
  );

  useEffect(() => {
    const source = createdCustomer ?? selectedCustomerFromDraft;
    if (!source) return;
    setValue("customerId", source.id, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setSelectedCustomer({ id: source.id, name: source.name });
    if (createdCustomer) dispatch(clearCreatedCustomer());
    else dispatch(clearSelectedCustomer());
  }, [createdCustomer, selectedCustomerFromDraft, dispatch, setValue]);

  return (
    <>
      <View className="flex-row items-end gap-2">
        <View className="flex-1">
          <RhfPressableField
            name="customerId"
            label="Клиент"
            hideErrorText
            startAdornment={
              <StSvg name="Search" size={24} color={colors.neutral[900]} />
            }
            displayValue={selectedCustomer?.name}
            placeholder="Поиск по имени или телефону"
            onPress={() => setModalVisible(true)}
          />
        </View>
        {showCreateButton && (
          <IconButton
            onPress={() => router.push(Routers.app.createClient)}
            icon={
              <StSvg name="Add_round" size={24} color={colors.neutral[900]} />
            }
          />
        )}
      </View>

      <CustomerPickerModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSelect={handleSelect}
      />
    </>
  );
};

export default CustomerSelectField;
