import React from "react";
import { View } from "react-native";
import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  AccountNotificationsSchema,
  type AccountNotificationsFormValues,
} from "@/src/validation/schemas/accountNotifications.schema";
import ScreenWithToolbar from "@/src/components/shared/layout/screenWithToolbar";
import { Item } from "@/src/components/ui";
import RHFSwitch from "@/src/components/hookForm/rhf-switch";
import { useAppSelector } from "@/src/store/redux/store";
import { useUpdateUserMutation } from "@/src/store/redux/services/api/usersApi";
import { toast } from "@backpackapp-io/react-native-toast";
import { getApiErrorMessage } from "@/src/utils/apiError";

const AccountNotifications = () => {
  const user = useAppSelector((s) => s.auth.user);
  const [updateUser] = useUpdateUserMutation();

  const methods = useForm<AccountNotificationsFormValues>({
    resolver: yupResolver(AccountNotificationsSchema),
    defaultValues: {
      newBooking: user?.is_notify_new_appointment ?? true,
      clientCancellation: user?.is_notify_customer_cancel ?? true,
      reminders: user?.is_notify_reminders ?? false,
    },
  });

  const onSubmit = async (values: AccountNotificationsFormValues) => {
    if (!user) return;
    try {
      await updateUser({
        id: user.id,
        data: {
          is_notify_new_appointment: values.newBooking,
          is_notify_customer_cancel: values.clientCancellation,
          is_notify_reminders: values.reminders,
        },
      }).unwrap();
    } catch (e) {
      toast.error(getApiErrorMessage(e, "Не удалось сохранить настройки"));
    }
  };

  const submit = () => methods.handleSubmit(onSubmit)();

  return (
    <FormProvider {...methods}>
      <ScreenWithToolbar title="Уведомления">
        {({ topInset }) => (
          <View style={{ paddingTop: topInset + 16 }} className="px-screen">
            <View className="overflow-hidden gap-2">
              <Item
                title="Новая запись"
                right={<RHFSwitch name="newBooking" onChange={submit} />}
              />
              <Item
                title="Отмена клиентом"
                right={
                  <RHFSwitch name="clientCancellation" onChange={submit} />
                }
              />
              <Item
                title="Напоминания"
                right={<RHFSwitch name="reminders" onChange={submit} />}
              />
            </View>
          </View>
        )}
      </ScreenWithToolbar>
    </FormProvider>
  );
};

export default AccountNotifications;
