import React from "react";
import { ScrollView, RefreshControl, Platform, View } from "react-native";
import { skipToken } from "@reduxjs/toolkit/query";
import ScreenWithToolbar from "@/src/components/shared/layout/screenWithToolbar";
import { ErrorScreen } from "@/src/components/shared/emptyStateScreen";
import { Typography } from "@/src/components/ui";
import ConsentsSection from "@/src/components/app/clients/clientDetail/ConsentsSection";
import { useGetUserCustomerQuery } from "@/src/store/redux/services/api/userCustomersApi";
import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";
import { useRefresh } from "@/src/hooks/useRefresh";
import { safeRefetch } from "@/src/utils/safeRefetch";
import { SCREEN_PADDING } from "@/src/constants/layout";
import { useAppSelector } from "@/src/store/redux/store";
import type { ConsentKind } from "@/src/store/redux/services/api-types";

type Props = { userCustomerId?: number; customerId?: number };

const ClientConsents = ({ userCustomerId, customerId }: Props) => {
  const auth = useRequiredAuth();
  const safeUserCustomerId = Number.isFinite(userCustomerId) ? userCustomerId : undefined;
  const safeCustomerId = Number.isFinite(customerId) ? customerId : undefined;
  const hasValidId = safeUserCustomerId !== undefined || safeCustomerId !== undefined;

  const { data, isLoading, isError, refetch } = useGetUserCustomerQuery(
    auth && hasValidId
      ? { userId: auth.userId, userCustomerId: safeUserCustomerId, customerId: safeCustomerId }
      : skipToken,
  );

  const { refreshing, onRefresh } = useRefresh(refetch);
  const masterUser = useAppSelector((s) => s.auth.user);
  const userCustomer = data?.user_customer;
  const consents = userCustomer?.consents ?? [];
  const customerName = userCustomer?.customer?.name;

  const enabledKinds: ConsentKind[] = [
    ...(masterUser?.is_personal_data_consent_enabled ? (["personal_data"] as ConsentKind[]) : []),
    ...(masterUser?.is_marketing_consent_enabled ? (["marketing"] as ConsentKind[]) : []),
  ];

  return (
    <ScreenWithToolbar title="Документы">
      {({ topInset, bottomInset }) => {
        if (isError || (!isLoading && !userCustomer)) {
          return (
            <ErrorScreen
              title="Не удалось загрузить документы"
              topInset={topInset}
              onRetry={() => safeRefetch(refetch)}
            />
          );
        }
        return (
          <ScrollView
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                progressViewOffset={Platform.select({ android: topInset })}
                refreshing={refreshing}
                onRefresh={onRefresh}
              />
            }
            contentContainerStyle={{
              paddingTop: Platform.OS === "ios" ? 0 : topInset,
              paddingBottom: bottomInset + 8,
              paddingHorizontal: SCREEN_PADDING,
            }}
            contentInset={Platform.OS === "ios" ? { top: topInset } : undefined}
            contentOffset={Platform.OS === "ios" ? { x: 0, y: -topInset } : undefined}
          >
            {consents.length === 0 && enabledKinds.length === 0 ? (
              <View className="mt-6">
                <Typography className="text-body text-neutral-400 text-center">
                  Клиент пока не подписал ни одного документа
                </Typography>
              </View>
            ) : (
              auth && (
                <ConsentsSection
                  userId={auth.userId}
                  consents={consents}
                  customerName={customerName}
                  enabledKinds={enabledKinds}
                />
              )
            )}
          </ScrollView>
        );
      }}
    </ScreenWithToolbar>
  );
};

export default ClientConsents;
