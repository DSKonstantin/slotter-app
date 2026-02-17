import { Schedule } from "@/src/store/redux/slices/calendarSlice";

const today = new Date();
const todayStr = today.toISOString().split("T")[0];

export const mockSchedule: Schedule[] = [
  {
    id: "1",
    timeStart: `${todayStr}T09:00:00.000Z`,
    timeEnd: `${todayStr}T10:00:00.000Z`,
    status: "available",
  },
  {
    id: "2",
    clientName: "Анна Петрова",
    timeStart: `${todayStr}T10:00:00.000Z`,
    timeEnd: `${todayStr}T11:00:00.000Z`,
    price: 3500,
    status: "confirmed",
    services: [
      "Стрижка + укладка",
      "Дополнительная услуга 1",
      "Дополнительная услуга 2",
    ],
  },
  {
    id: "3",
    clientName: "Мария Иванова",
    timeStart: `${todayStr}T11:00:00.000Z`,
    timeEnd: `${todayStr}T13:00:00.000Z`,
    price: 5000,
    status: "pending",
    services: ["Окрашивание"],
  },
  {
    id: "4",
    timeStart: `${todayStr}T13:00:00.000Z`,
    timeEnd: `${todayStr}T15:00:00.000Z`,
    status: "available",
  },
  {
    id: "5",
    clientName: "Ольга Сидорова",
    timeStart: `${todayStr}T15:00:00.000Z`,
    timeEnd: `${todayStr}T16:30:00.000Z`,
    price: 4000,
    status: "confirmed",
    services: ["Укладка вечерняя", "Дополнительная услуга 3"],
  },
  {
    id: "6",
    timeStart: `${todayStr}T16:30:00.000Z`,
    timeEnd: `${todayStr}T17:00:00.000Z`,
    status: "available",
  },
];
