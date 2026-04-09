import React, { useState } from "react";
import { ActivityIndicator, ScrollView, View } from "react-native";
import { router } from "expo-router";
import { skipToken } from "@reduxjs/toolkit/query";
import { Routers } from "@/src/constants/routers";
import ScreenWithToolbar from "@/src/components/shared/layout/screenWithToolbar";
import { useGetExpenseCategoriesQuery } from "@/src/store/redux/services/api/financesApi";
import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";
import {
  Card,
  Divider,
  IconButton,
  StSvg,
  Typography,
} from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import IncomeCard from "@/src/components/shared/cards/incomeCard";
import StatCard from "@/src/components/shared/cards/statСard";
import CreateExpenseModal from "./createExpenseModal";
import map from "lodash/map";

const FinancesScreen = () => {
  const auth = useRequiredAuth();
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  const { data, isLoading } = useGetExpenseCategoriesQuery(
    auth ? { userId: auth.userId } : skipToken,
  );

  const categories = data?.expense_categories ?? [];

  return (
    <ScreenWithToolbar title="Финансы">
      {({ topInset, bottomInset }) => (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingTop: topInset,
            paddingBottom: bottomInset + 16,
            paddingHorizontal: 20,
            gap: 20,
          }}
        >
          <IncomeCard
            label="Доходы за октябрь"
            totalIncome="87 500 ₽"
            items={[
              { label: "Визитов", value: "18" },
              { label: "Средний чек", value: "4 861 ₽" },
              { label: "Рост", value: "+12%" },
            ]}
          />

          <Card
            title="Доходы по периоду"
            onPress={() => router.push(Routers.app.menu.finances.income)}
            titleProps={{ style: { color: colors.primary.blue[500] } }}
            subtitle="Динамика по дням/месяцам"
            left={
              <View className="mb-[18px]">
                <StSvg
                  name="Calendar_fill"
                  size={24}
                  color={colors.primary.blue[500]}
                />
              </View>
            }
            right={
              <StSvg
                name="Expand_right_light"
                size={24}
                color={colors.neutral[500]}
              />
            }
          />

          <Divider />

          <View className="p-4 bg-background-surface rounded-base gap-4">
            <View className="flex-row justify-between items-center">
              <Typography weight="medium" className="text-body">
                Расходы
              </Typography>
              <IconButton
                size="sm"
                onPress={() => setIsExpenseModalOpen(true)}
                icon={
                  <StSvg
                    name="Add_ring_fill_light"
                    size={28}
                    color={colors.primary.blue[500]}
                  />
                }
              />
            </View>

            <Divider />

            {isLoading ? (
              <ActivityIndicator />
            ) : (
              map(categories, (category, index) => (
                <View key={category.id}>
                  {index > 0 && <Divider className="mb-4" />}
                  <View className="flex-row justify-between items-center">
                    <Typography className="text-body text-neutral-900">
                      {category.name}
                    </Typography>

                    <Typography weight="regular" className="text-body">
                      0
                    </Typography>
                  </View>
                </View>
              ))
            )}

            <Divider />

            <View className="flex-row justify-between items-center">
              <Typography className="text-body">Итого расходов</Typography>
              <Typography className="text-body">18 500 ₽</Typography>
            </View>
          </View>

          <View className="flex-row gap-2.5">
            <StatCard
              value={"8 500 ₽"}
              label="Предоплаты"
              tag={{ title: "3 чел", size: "sm", variant: "info" }}
            />

            <StatCard
              value={"84 000 ₽"}
              label="Чистая прибыль"
              tag={{ title: "+ 43%", size: "sm", variant: "mint" }}
            />
          </View>

          <CreateExpenseModal
            visible={isExpenseModalOpen}
            onClose={() => setIsExpenseModalOpen(false)}
          />
        </ScrollView>
      )}
    </ScreenWithToolbar>
  );
};

export default FinancesScreen;
