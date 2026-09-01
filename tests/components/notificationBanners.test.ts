import { NOTIFICATION_BANNERS } from "@/src/components/app/root/notificationBanners/bannerConfig";

const titleFor = (key: string, count: number) =>
  NOTIFICATION_BANNERS.find((b) => b.key === key)!.buildTitle(count);

describe("NOTIFICATION_BANNERS buildTitle — русская плюрализация", () => {
  it("pending: неподтверждённые записи", () => {
    expect(titleFor("pending", 1)).toBe("1 неподтверждённая запись");
    expect(titleFor("pending", 3)).toBe("3 неподтверждённые записи");
    expect(titleFor("pending", 5)).toBe("5 неподтверждённых записей");
  });

  it("reschedule: запрос(а/ов) на перенос — #фикс склонений", () => {
    expect(titleFor("reschedule", 1)).toBe("1 запрос на перенос");
    expect(titleFor("reschedule", 2)).toBe("2 запроса на перенос");
    expect(titleFor("reschedule", 5)).toBe("5 запросов на перенос");
    expect(titleFor("reschedule", 21)).toBe("21 запрос на перенос");
    expect(titleFor("reschedule", 11)).toBe("11 запросов на перенос");
  });

  it("cancelledToday: отмена/отмены/отмен на сегодня", () => {
    expect(titleFor("cancelledToday", 1)).toBe("1 отмена на сегодня");
    expect(titleFor("cancelledToday", 3)).toBe("3 отмены на сегодня");
    expect(titleFor("cancelledToday", 5)).toBe("5 отмен на сегодня");
  });
});
