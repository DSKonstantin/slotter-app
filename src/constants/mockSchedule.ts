import { Schedule } from "@/src/store/redux/slices/calendarSlice";

const today = new Date();
const todayStr = today.toISOString().split("T")[0];

const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);
const tomorrowStr = tomorrow.toISOString().split("T")[0];

const dayAfterTomorrow = new Date(today);
dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
const dayAfterTomorrowStr = dayAfterTomorrow.toISOString().split("T")[0];

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
  {
    id: "7",
    clientName: "Завтрашний Клиент",
    timeStart: `${tomorrowStr}T10:00:00.000Z`,
    timeEnd: `${tomorrowStr}T11:00:00.000Z`,
    price: 2000,
    status: "confirmed",
    services: ["Массаж"],
  },
  {
    id: "8",
    clientName: "Послезавтрашний Клиент",
    timeStart: `${dayAfterTomorrowStr}T14:00:00.000Z`,
    timeEnd: `${dayAfterTomorrowStr}T15:00:00.000Z`,
    price: 3000,
    status: "pending",
    services: ["Укладка"],
  },
  {
    id: "9",
    clientName: "Клиент через неделю",
    timeStart: `${new Date(today.setDate(today.getDate() + 7)).toISOString().split('T')[0]}T09:30:00.000Z`,
    timeEnd: `${new Date(today.setDate(today.getDate() + 7)).toISOString().split('T')[0]}T10:30:00.000Z`,
    price: 1500,
    status: "available",
    services: ["Консультация"],
  },
];
