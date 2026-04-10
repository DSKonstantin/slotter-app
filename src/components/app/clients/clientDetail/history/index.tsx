import React, { useState } from "react";
import { View, ScrollView } from "react-native";
import { FlashList } from "@shopify/flash-list";
import ScreenWithToolbar from "@/src/components/shared/layout/screenWithToolbar";
import {
  Avatar,
  Card,
  IconButton,
  StSvg,
  Typography,
} from "@/src/components/ui";
import IncomeCard from "@/src/components/shared/cards/incomeCard";
import { colors } from "@/src/styles/colors";
import TrendChartCard from "@/src/components/shared/cards/trendChartCard";
import ServiceCard from "@/src/components/app/clients/clientDetail/history/ServiceCard";

const MOCK_SERVICE_SECTIONS = [
  {
    title: "В этом месяце",
    services: [
      { name: "Окрашивание тон в тон / тонирование" },
      { name: "Маникюр классический" },
    ],
  },
  {
    title: "За прошлые 3 месяца",
    services: [
      { name: "Стрижка + Укладка" },
      { name: "Окрашивание" },
      { name: "Педикюр" },
    ],
  },
  {
    title: "Ранее",
    services: [{ name: "Стрижка" }, { name: "Укладка" }],
  },
];

const MOCK_PAYMENTS = [
  {
    id: 1,
    title: "Стрижка + Укладка",
    date: "20 октября",
    time: "14:00",
    amount: "+ 4 500 ₽",
  },
  {
    id: 2,
    title: "Окрашивание",
    date: "5 октября",
    time: "11:00",
    amount: "+ 8 200 ₽",
  },
  {
    id: 3,
    title: "Маникюр",
    date: "28 сентября",
    time: "15:30",
    amount: "+ 2 800 ₽",
  },
  {
    id: 4,
    title: "Стрижка",
    date: "10 сентября",
    time: "12:00",
    amount: "+ 1 500 ₽",
  },
  {
    id: 5,
    title: "Укладка + Маникюр",
    date: "1 сентября",
    time: "10:00",
    amount: "+ 3 500 ₽",
  },
];

type Props = { customerId: number };

const ClientHistory = ({ customerId: _ }: Props) => {
  const [filterActive, setFilterActive] = useState(false);
  return (
    <ScreenWithToolbar
      title="История посещений"
      rightButton={
        <IconButton
          icon={
            <StSvg
              name="Sort_arrow"
              size={28}
              color={
                filterActive ? colors.primary.blue[500] : colors.neutral[900]
              }
            />
          }
          onPress={() => setFilterActive((v) => !v)}
        />
      }
    >
      {({ topInset, bottomInset }) => (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingTop: topInset,
            paddingBottom: bottomInset + 16,
            paddingHorizontal: 20,
          }}
        >
          <View className="items-center mb-5">
            <View className="flex-row gap-2 bg-background-surface rounded-base py-1 pl-1 pr-2.5 items-center">
              <Avatar size="xs" />
              <Typography className="text-body">Анна Петрова</Typography>
            </View>
          </View>

          {filterActive ? (
            <View className="gap-6">
              {MOCK_SERVICE_SECTIONS.map((section) => (
                <View key={section.title} className="gap-4">
                  <Typography className="text-body">{section.title}</Typography>
                  <FlashList
                    data={section.services}
                    keyExtractor={(item) => item.name}
                    numColumns={2}
                    scrollEnabled={false}
                    ItemSeparatorComponent={() => <View className="h-3" />}
                    renderItem={({ item, index }) => (
                      <View
                        style={{
                          flex: 1,
                          marginRight: index % 2 === 0 ? 6 : 0,
                        }}
                      >
                        <ServiceCard service={item} />
                      </View>
                    )}
                  />
                </View>
              ))}
            </View>
          ) : (
            <View className="gap-5">
              <IncomeCard
                totalIncome="52 500 ₽"
                items={[
                  { label: "Визитов", value: "15" },
                  { label: "Последний визит", value: "8 апр. 2026" },
                ]}
              />

              <TrendChartCard title="Динамика" />

              <View className="gap-2">
                <Typography className="text-caption">История оплат</Typography>
                {MOCK_PAYMENTS.map((payment) => (
                  <Card
                    key={payment.id}
                    title={payment.title}
                    subtitle={`${payment.date} | ${payment.time}`}
                    right={
                      <Typography className="text-body">
                        {payment.amount}
                      </Typography>
                    }
                  />
                ))}
              </View>
            </View>
          )}
        </ScrollView>
      )}
    </ScreenWithToolbar>
  );
};

export default ClientHistory;
