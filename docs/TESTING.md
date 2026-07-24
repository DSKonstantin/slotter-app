# Что ещё можно покрыть тестами

Инфраструктура (`jest-expo`, `@testing-library/react-native`, `jest.config.js`) уже настроена — см. `tests/utils/date/formatTime.test.ts` и `tests/utils/price/formatPrice.test.ts` как референс. Тесты живут в отдельном top-level каталоге `tests/`, зеркалирующем структуру `src/` (`tests/hooks/`, `tests/utils/...`, `tests/validation/...` и т.д.), импорты — через алиас `@/src/...` вместо относительных путей. Дальше — приоритизированный список, от «просто и дёшево» до «дорого и нужно отдельно решать, стоит ли».

## 1. Чистые утилиты (`src/utils/`) — низкие усилия, высокая отдача

Не требуют моков, конфига или Redux — берёшь функцию, дёргаешь с разными аргументами.

- **`apiError/index.ts`** — `getApiErrorMessage`, `isAuthError`, `isQuotaExceeded`, `getApiErrorCode`. Самое ценное из всего списка: реальная ветвящаяся бизнес-логика (что считать смертью токена, когда доверять `errors` vs `error`, фильтрация нелокализованных сообщений через `isValidMessage` — regex на кириллицу), используется буквально в каждом экране для тостов об ошибках. ✅ покрыто.
- **`customer.ts`** — `isHiddenCustomer` (различие «клиента нет» vs «клиент скрыт квотой», `id === null` vs `customer === null`). ✅ покрыто.
- **`directChannel.ts`** — `isDirectChannelActive`. ✅ покрыто.
- **`text/pluralize.ts`, `text/suggestNickname.ts`, `text/transliterate.ts`** — классические edge-cases (1/2/5 объектов, кириллица → латиница, спецсимволы в нике). ✅ покрыто.
- **`schedule/appointmentStepToMinutes.ts`, `schedule/getDatesUntilEndOfWeek.ts`, `schedule/groupSlotsByHour.ts`** — группировка слотов по часам, границы недели. ✅ покрыто.
- **`date/formatDate.ts`, `date/generateMonthRange.ts`, `date/isBirthdayToday.ts`, `date/resolvePresetToDate.ts`** — дата-хелперы вне уже покрытого `formatTime.ts`; `isBirthdayToday` особенно достоин теста на границу года (31 декабря / 1 января). ✅ покрыто. (`date/date.ts` — просто `setDefaultOptions({ locale: ru })` при импорте, тестировать нечего.)
- **`calendar/scheduleHelpers.ts`, `asArray.ts`, `safeRefetch.ts`** — более мелкие, но чистые. ✅ покрыто.

## 2. Yup-схемы (`src/validation/`) — низкие-средние усилия

Схема — тоже чистая функция: `schema.isValidSync(payload)` / `schema.validate(payload)`. Проверяются реальные правила, которые видит пользователь при сабмите формы.

- **`validation/utils/timeRange.ts`** — самый содержательный файл в папке (130 строк): `isEndAfterStart`, `isWithinDay`, судя по всему ещё проверка пересечения перерывов. Именно такая логика больше всего любит прятать off-by-one баги на границах (`end === start`, перерыв ровно на границе рабочего дня). ✅ покрыто.
- **`validation/utils/parseTimeToMinutes.ts`** — парсинг `"HH:mm"` → минуты, граничные/невалидные строки. ✅ покрыто.
- **`validation/fields/*.ts`** (phone, price, duration, nickname, password, avatar и т.д.) — отдельные переиспользуемые поля, по 5-10 тестов на каждое окупятся, т.к. они используются в десятке схем сразу. ✅ покрыто (name/surname/profession/title/description — table-driven в `textFields.test.ts`, т.к. одна форма).
- **`validation/schemas/*.ts`** (25 файлов) — для каждой формы 2-3 теста «валидный payload проходит» / «типичная ошибка отклоняется» достаточно; не нужно покрывать все 25 сразу. ✅ начато: `slotDetails.schema.ts`, `slotReschedule.schema.ts`, `calendarSchedule.schema.ts` (самая часто меняющаяся логика в этой сессии). Остальные 22 — по мере необходимости, не всё сразу.

## 3. Redux-слайсы (`src/store/redux/slices/`) — низкие-средние усилия

Редьюсер — чистая функция `(state, action) => state`, тестируется через `configureStore` без рендера компонентов.

- **`authSlice.ts`** — уже разбирали в этой сессии: матчеры на `getMe`/`getSubscriptionMembership`/`login`/`updateUser` fulfilled/pending/rejected, плюс `extractUser`/`setUserOnly` (в частности хрупкая логика «не затирать `subscription_membership`, если новый payload его не несёт» — прямая кандидатура на регрессионный тест, история уже видела баг рядом с этим). ✅ покрыто.
- **`clientsSlice.ts`, `calendarSlice.ts`, `servicesSlice.ts`, `slotDraftSlice.ts`, `uiSlice.ts`, `appVersionSlice.ts`** — обычные `reducers`/`extraReducers`, дешёво покрыть базовые action'ы. ✅ все слайсы покрыты.

## 4. Хуки (`src/hooks/`) — средние усилия

Нужен `renderHook` из `@testing-library/react-native` (уже установлен) + при необходимости обёртка `Provider` с mock-store (Redux) или `QueryClientProvider`-аналог для RTK Query.

- Без Redux/API — дешевле всего: **`useCountdown.ts`**, **`useSlotStep.ts`**, **`useSafeBack.ts`**, **`useDaDataSuggestions.ts`** (мок fetch; т.к. `API_KEY` читается из `process.env` один раз при импорте модуля, ветка «ключ настроен» вынесена в отдельный файл `useDaDataSuggestions.withApiKey.test.ts`, где `process.env` выставляется перед `require()` — иначе ES `import` подтянет модуль раньше, до присвоения). ✅ покрыто.
- С Redux, но без сети — средне: **`useSubscriptionQuota.ts`** (мы недавно трогали — хороший кандидат проверить `shouldFetchQuota` на всех трёх состояниях membership), **`useScheduleTemplate.ts`**, **`useMonthCalendarData.ts`**, **`useWorkingDaysCalendar.ts`**. ✅ покрыто.
- **`useRefetchOnForeground.ts`**, **`useRunOnNextForeground.ts`** — завязаны на `AppState`/`Navigation`, нужны моки `react-native`'s `AppState.addEventListener` и `expo-router`'s `useNavigation`; не самые дешёвые, но логика (гейт по `isFocused()`, транзишен `background→active`) достаточно тонкая, чтобы стоило. ✅ покрыто.

## 5. RTK Query эндпоинты (`src/store/redux/services/api/*.ts`) — высокие усилия

Тут либо `msw` (Mock Service Worker, перехватывает HTTP на уровне сети — реалистичнее) либо ручной мок `axiosBaseQuery`. Ни то ни другое не установлено. Первым шагом стоит проверить не сами запросы (их формируют одной строкой), а трансформации ответов и `providesTags`/`invalidatesTags` — то есть кэш-инвалидацию, которую тяжелее всего отловить руками (в этой сессии как раз обсуждали cross-slice инвалидацию `SubscriptionMembership`).

## 6. Компоненты (`src/components/`) — высокие усилия

`@testing-library/react-native` уже стоит, но каждый тест потребует моков `expo-router` (навигация), `redux-persist`/`Provider`, `SafeAreaProvider`, а местами `react-native-reanimated`/`react-native-gesture-handler` (мока для reanimated 4 в комплекте пакета уже нет — придётся писать свой, `jest.setup.js` сейчас подключает только `gesture-handler`). Начинать разумно с презентационных компонентов без сети — например `directChannelRowStatus.ts` (чистая функция, кстати — её вообще можно унести в раздел 1) или карточки вида `StatCard`, а не с экранов целиком.

## 7. E2E (Detox / Maestro) — не начинать без запроса

Отдельная инфраструктура поверх нативного билда (не Jest). Даёт самую высокую уверенность, но и самая дорогая в поддержке. Стоит рассматривать только когда наберётся костяк unit/component-тестов и появится CI, который может собирать dev-client под симулятор.

---

**Рекомендация по порядку**: раздел 1 → раздел 3 (слайсы) → раздел 2 (схемы, начиная с `timeRange.ts`) → раздел 4 (хуки без сети) → дальше по мере необходимости. Разделы 5-7 откладывать, пока не появится конкретная боль (регресс в кэше RTK Query, сломанный экран) — их цена входа ощутимо выше отдачи на старте.

**Текущий статус**: разделы 1, 3, 4 закрыты полностью; раздел 2 закрыт по утилитам/полям, из 25 схем покрыто 3 (осталось 22, добавлять по мере изменений в этих формах). Разделы 5 (RTK Query), 6 (компоненты) и 7 (E2E) ещё не начаты — по-прежнему ждут конкретного повода (см. описание в соответствующих разделах выше).
