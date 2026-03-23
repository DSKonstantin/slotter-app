import React from "react";
import { View } from "react-native";
import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import ScreenWithToolbar from "@/src/components/shared/layout/screenWithToolbar";
import { Divider, Item } from "@/src/components/ui";
import RHFSwitch from "@/src/components/hookForm/rhf-switch";

type FormValues = {
  newBooking: boolean;
  clientCancellation: boolean;
  reminders: boolean;
};

const schema = Yup.object({
  newBooking: Yup.boolean().required(),
  clientCancellation: Yup.boolean().required(),
  reminders: Yup.boolean().required(),
});

const AccountNotifications = () => {
  const methods = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      newBooking: true,
      clientCancellation: true,
      reminders: false,
    },
  });

  return (
    <FormProvider {...methods}>
      <ScreenWithToolbar title="Уведомления">
        {({ topInset }) => (
          <View style={{ paddingTop: topInset + 16 }} className="px-screen">
            <View className="overflow-hidden gap-2">
              <Item
                title="Новая запись"
                right={<RHFSwitch name="newBooking" />}
              />
              <Item
                title="Отмена клиентом"
                right={<RHFSwitch name="clientCancellation" />}
              />
              <Item
                title="Напоминания"
                right={<RHFSwitch name="reminders" />}
              />
            </View>
          </View>
        )}
      </ScreenWithToolbar>
    </FormProvider>
  );
};

export default AccountNotifications;
