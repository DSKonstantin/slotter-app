import { IMessage } from "react-native-gifted-chat";

export const MOCK_USER = { _id: 1, name: "Вы" };
export const MOCK_OTHER = { _id: 2, name: "Алексей" };

const m = (
  id: number,
  text: string,
  minutesAgo: number,
  user: typeof MOCK_USER | typeof MOCK_OTHER,
): IMessage => ({
  _id: id,
  text,
  createdAt: new Date(Date.now() - minutesAgo * 60 * 1000),
  user,
});

export const MOCK_MESSAGES: IMessage[] = [
  m(30, "До встречи!", 0, MOCK_USER),
  m(29, "Хорошо, жду вас завтра в 14:00 👍", 1, MOCK_OTHER),
  m(28, "Всё верно, записала. Спасибо!", 2, MOCK_USER),
  m(27, "Итого: массаж + масло лаванды = 2300 ₽", 3, MOCK_OTHER),
  m(26, "Подтверждаю доплату", 4, MOCK_USER),
  m(25, "Масло лаванды +300 ₽, хорошо?", 5, MOCK_OTHER),
  m(24, "Да, пожалуйста добавьте масло лаванды", 6, MOCK_USER),
  m(23, "Есть масло лаванды и эвкалипта, желаете добавить?", 8, MOCK_OTHER),
  m(22, "А какие ароматические масла используете?", 10, MOCK_USER),
  m(21, "Стандартный массаж — 60 минут, 2000 ₽", 12, MOCK_OTHER),
  m(20, "Какова стоимость процедуры?", 14, MOCK_USER),
  m(19, "Да, завтра в 14:00 есть свободное время", 16, MOCK_OTHER),
  m(18, "Можно записаться на завтра на 14:00?", 18, MOCK_USER),
  m(17, "Конечно, чем могу помочь?", 20, MOCK_OTHER),
  m(16, "Добрый день!", 22, MOCK_USER),
  m(15, "Здравствуйте! Записались успешно на прошлой неделе", 60, MOCK_OTHER),
  m(14, "Хочу уточнить детали записи", 62, MOCK_USER),
  m(13, "Напомните, пожалуйста, адрес", 64, MOCK_OTHER),
  m(12, "ул. Пушкина, д. 10, каб. 5", 65, MOCK_USER),
  m(11, "Спасибо, нашёл!", 66, MOCK_OTHER),
  m(10, "До встречи в пятницу", 67, MOCK_USER),
  m(9, "Обязательно приходите за 5 минут до начала", 68, MOCK_OTHER),
  m(8, "Хорошо, учту", 69, MOCK_USER),
  m(7, "Если что-то изменится — напишите заранее", 70, MOCK_OTHER),
  m(6, "Понял, договорились", 71, MOCK_USER),
  m(5, "Отлично!", 72, MOCK_OTHER),
  m(4, "Кстати, у вас есть парковка рядом?", 73, MOCK_USER),
  m(3, "Да, бесплатная парковка во дворе", 74, MOCK_OTHER),
  m(2, "Отлично, очень удобно!", 75, MOCK_USER),
  m(1, "Привет! Как дела?", 80, MOCK_OTHER),
];
