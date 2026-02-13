const mockSlots = [
  {
    id: "1",
    variant: "free",
    startTime: "9:00",
    endTime: "10:00",
  },
  {
    id: "2",
    variant: "booked",
    startTime: "10:00",
    endTime: "11:00",
    client: "Анна Петрова",
    price: "3 500 ₽",
    service: "Стрижка + укладка",
    additional: "+ 2 доп.",
    status: "confirmed",
  },
  {
    id: "3",
    variant: "booked",
    startTime: "11:00",
    endTime: "13:00",
    client: "Мария Иванова",
    price: "5 000 ₽",
    service: "Окрашивание",
    status: "pending",
  },
  {
    id: "4",
    variant: "free",
    startTime: "13:00",
    endTime: "15:00",
  },
  {
    id: "5",
    variant: "booked",
    startTime: "15:00",
    endTime: "16:30",
    client: "Ольга Сидорова",
    price: "4 000 ₽",
    service: "Укладка вечерняя",
    additional: "+ 1 доп.",
    status: "confirmed",
  },
  {
    id: "6",
    variant: "free",
    startTime: "16:30",
    endTime: "17:00",
  },
];

export { mockSlots };
