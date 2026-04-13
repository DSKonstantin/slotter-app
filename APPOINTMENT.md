# Appointments — API Documentation

---

## Архитектура

- `appointments` привязаны к `working_day` (не к дате напрямую)
- `user_id` дублируется в `appointments` для быстрых запросов без join
- `date` — виртуальное поле (берётся из `working_day.day` в blueprint, в БД не хранится)
- `end_time` хранится и вычисляется: `start_time + duration.minutes` (before_validation)
- `public_token` — генерируется автоматически в `before_create` через `SecureRandom.urlsafe_base64(16)`
- Статус-машина: AASM + Rails enum на integer-колонке

---

## Таблица `appointments`

```
working_day_id    (FK -> working_days, not null)
user_id           (FK -> users, not null)
customer_id       (FK -> customers, nullable)
start_time        (time, not null)
end_time          (time, not null)
duration          (integer, minutes, not null, default: 0)
price_cents       (integer, not null, default: 0)
price_currency    (string, default: 'RUB')
status            (integer, not null, default: 0)
payment_method    (integer, not null, default: 0)
comment           (text)
cancel_reason     (text)
send_notification (boolean, not null, default: true)
public_token      (string, unique)
```

Join-таблицы: `appointment_services`, `appointment_additional_services`

---

## Статусы — AASM

```
pending --confirm--> confirmed --arrive--> arrived --complete--> completed
   |                    |                                            ^
   |                    +--mark_late--> late --complete-------------+
   |                    |
   |                    +--mark_no_show--> no_show
   |
   +--cancel--> cancelled
confirmed --cancel--> cancelled

reschedule: pending | confirmed -> pending (меняет working_day_id + start_time)
```

При невозможном переходе: HTTP 422, `{ errors: { status: ["..."] } }`

---

## Логика duration и price_cents

- Ключ передан в params → берётся из params (ручной ввод)
- Ключ не передан → автопересчёт: сумма по services + additional_services
- `end_time` пересчитывается всегда через `before_validation`

## Управление услугами

- `service_ids: [1, 2]` — полная замена (replace), только услуги мастера
- `additional_service_ids: [3, 4]` — полная замена (replace), только доп. услуги мастера
- Ключ не передан → текущий набор не меняется
- Лимиты: services ≤ 5, additional_services ≤ 10

## Проверка пересечений

- `duration == 0` → overlap-проверка пропускается (запись-заглушка)
- Иначе: проверка по `working_day_id`, `start_time < new_end AND end_time > new_start`, исключая текущую запись при update
- Запись на время перерыва (`working_day_breaks`) → 422 `{ errors: { start_time: ["пересекается с перерывом"] } }`

## Авторизация

- `GET show` / `cancel_by_token` — публичные (без JWT)
- `GET index` / все остальные действия — только владелец (User, JWT)
- `cancel_by_token` защищён `public_token` вместо JWT — случайная строка, не перебираемая в отличие от sequential ID

---

## Эндпоинты — мастер (JWT)

### GET /api/v1/users/:user_id/appointments

Требует JWT.

| Параметр | Поведение |
|---|---|
| без фильтров | записи за сегодня |
| `?date=YYYY-MM-DD` | массив за один день |
| `?date_from=...&date_to=...` | объект по дням (пустые дни → `[]`) |
| `?status=confirmed` | фильтр по одному статусу |
| `?status=confirmed,pending,arrived` | фильтр по нескольким статусам (через запятую) |

Допустимые значения status: `pending`, `confirmed`, `arrived`, `late`, `no_show`, `cancelled`, `completed`.
Неверное значение → 422 `{ errors: { status: ["недопустимые значения: ..."] } }`.

Пример ответа при date_from/date_to:
```json
{
  "2026-03-01": [{ "id": 1, "..." : "..." }],
  "2026-03-02": [],
  "2026-03-03": [{ "id": 2, "..." : "..." }]
}
```

### POST /api/v1/users/:user_id/appointments

```json
{
  "appointment": {
    "date": "2026-03-10",
    "start_time": "10:00",
    "customer_id": 1,
    "service_ids": [1, 2],
    "additional_service_ids": [3],
    "duration": 90,
    "price_cents": 3000,
    "payment_method": "cash",
    "comment": "...",
    "send_notification": true
  }
}
```

- `customer_id` — необязателен (запись без клиента допустима)
- `duration`, `price_cents` — необязательны, автопересчёт из услуг если не переданы
- `payment_method`: `cash` | `sbp` | `online_bank`, default: `cash`
- `service_ids`, `additional_service_ids` — необязательны

### GET /api/v1/appointments/:id

Полные детали записи. **Публичный** (без JWT).

### PATCH /api/v1/appointments/:id

```json
{
  "appointment": {
    "comment": "...",
    "service_ids": [1],
    "additional_service_ids": [],
    "duration": 60,
    "price_cents": 2000,
    "payment_method": "sbp",
    "send_notification": false
  }
}
```

Все поля необязательны. Незаполненные — не меняются.

### Статусные переходы

```
PATCH /api/v1/appointments/:id/confirm
PATCH /api/v1/appointments/:id/arrive
PATCH /api/v1/appointments/:id/mark_late
PATCH /api/v1/appointments/:id/mark_no_show
PATCH /api/v1/appointments/:id/complete
PATCH /api/v1/appointments/:id/cancel      — body: { "appointment": { "cancel_reason": "..." } }
PATCH /api/v1/appointments/:id/reschedule  — body: { "appointment": { "date": "...", "start_time": "...", "duration": 60 } }
PATCH /api/v1/appointments/:id/remind      — доступен из любого статуса кроме cancelled и completed
```

Неверный переход → HTTP 422.

### PATCH /api/v1/appointments/by_token/:public_token/cancel — публичный

Отмена клиентом без JWT. Защищён `public_token`.

- `public_token` возвращается в ответе на создание записи (мастером или через самозапись)
- React строит ссылку: `/appointments/:public_token` → по ней клиент может отменить запись

---

## GET /api/v1/users/:user_id/available_slots

```
GET /api/v1/users/:user_id/available_slots?date=YYYY-MM-DD&step=15
```

| Параметр | Значения | Default |
|---|---|---|
| `date` | YYYY-MM-DD | обязателен |
| `step` | 5 / 10 / 15 / 30 / 60 | `user.appointment_step` |

- Вычитает `working_day_breaks` и appointments с `duration > 0` и `status != cancelled`
- Возвращает массив строк: `["09:00", "09:15", "09:30", ...]`
- Нет working_day на дату → `[]`
- working_day найден, но `is_active: false` → `[]`

---

## Самозапись клиента (без JWT)

1. Мастер генерирует ссылку на услугу → `POST /api/v1/services/:id/generate_booking_token` (JWT)
2. Мастер отзывает ссылку → `DELETE /api/v1/services/:id/revoke_booking_token` (JWT)
3. React строит ссылку `/book/:token` — клиент открывает без авторизации

### GET /api/v1/book/:token

Данные для страницы записи — сервис + краткая инфа о мастере.

```json
{
  "service": { "id": 1, "name": "Стрижка", "duration": 60, "price_cents": 2000, "booking_token": "abc123" },
  "master": { "id": 1, "first_name": "Иван", "last_name": "Петров", "profession": "barber", "avatar_url": "..." }
}
```

### GET /api/v1/book/:token/available_slots?date=YYYY-MM-DD&step=15

Свободные слоты мастера на дату. Логика идентична `/users/:user_id/available_slots`.

### POST /api/v1/book/:token/appointments

```json
{
  "appointment": {
    "date": "2026-03-10",
    "start_time": "10:00",
    "customer_phone": "+79001234567",
    "customer_name": "Анна",
    "service_ids": [1, 2],
    "additional_service_ids": [3]
  }
}
```

- `customer_phone` — обязателен
- `customer_name` — необязателен
- `service_ids` — необязателен. Если передан — используются эти услуги мастера. Если нет — используется услуга по токену
- `additional_service_ids` — необязателен
- `Customer.find_or_initialize_by(phone:)` — находит или создаёт клиента
- Duration и price_cents рассчитываются из выбранных услуг
- Если `is_active: false` у рабочего дня → 422
- Статус зависит от `user.is_auto_approve`: `true` → `confirmed`, `false` → `pending`

Ответ:
```json
{
  "appointment": {
    "id": 42,
    "status": "confirmed",
    "date": "2026-03-10",
    "start_time": "10:00:00",
    "public_token": "xyz789"
  }
}
```

---

## Blueprint (ответ на все мастерские эндпоинты)

```json
{
  "id": 1,
  "status": "confirmed",
  "payment_method": "cash",
  "start_time": "10:00:00",
  "end_time": "11:30:00",
  "duration": 90,
  "price_cents": 3000,
  "price_currency": "RUB",
  "comment": "...",
  "cancel_reason": null,
  "send_notification": true,
  "public_token": "xyz789",
  "date": "2026-03-10",
  "customer": {
    "id": 1,
    "name": "Анна",
    "phone": "+79001234567",
    "email": null,
    "telegram_id": null
  },
  "services": [{ "id": 1, "name": "Стрижка", "duration": 60, "price_cents": 2000, "price_currency": "RUB" }],
  "additional_services": [{ "id": 3, "name": "Укладка", "duration": 30, "price_cents": 1000, "price_currency": "RUB" }]
}
```

`customer` может быть `null` если запись создана без клиента.

---

## Уведомления (Telegram)

Отправляются асинхронно через `TelegramNotificationWorker` (Sidekiq).

`send_notification: false` на записи блокирует **все** уведомления по ней.
Если `telegram_id` у получателя отсутствует — уведомление тихо пропускается.
Если у записи нет клиента — уведомления клиенту не отправляются.

| Событие | Получатель | Текст сообщения |
|---|---|---|
| `cancel` мастером | клиент | "Ваша запись на {date} в {time} отменена. Причина: {reason}" |
| `reschedule` | клиент | "Ваша запись перенесена. Новая дата: {date} в {time}." |
| `remind` | клиент | "Напоминаем о вашей записи на {date} в {time}." |
| `cancel_by_token` клиентом | мастер | "Клиент {name\|phone\|Аноним} отменил запись на {date} в {time}." |
| Самозапись через `/book/:token` | мастер | "Новая запись: {name} ({phone}) на {date} в {time}." |
