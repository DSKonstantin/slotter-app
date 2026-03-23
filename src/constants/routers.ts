export const Routers = {
  root: "/",
  auth: {
    root: "/(auth)",
    login: "/(auth)/login",
    restoreLogin: "/(auth)/restore-login",
    verify: "/(auth)/verify",
    enterCode: "/(auth)/enter-code",
  },
  onboarding: {
    root: "/(onboarding)",
    register: "/(onboarding)/register",
    experience: "/(onboarding)/experience",
    database: "/(onboarding)/database",
    databaseSuccess: "/(onboarding)/database-success",
    personalInformation: "/(onboarding)/personal-information",
    service: "/(onboarding)/service",
    schedule: "/(onboarding)/schedule",
    notification: "/(onboarding)/notification",
    link: "/(onboarding)/link",
  },
  app: {
    root: "/(app)",
    calendar: {
      root: (date?: string, mode?: string) =>
        date
          ? ({
              pathname: "/(app)/calendar",
              params: { date, ...(mode && { mode }) },
            } as const)
          : ("/(app)/calendar" as const),
      schedule: (
        date?: string,
        extra?: { openTemplate?: boolean; duplicateFrom?: string },
      ) =>
        ({
          pathname: "/(app)/calendar/schedule",
          params: {
            ...(date && { date }),
            ...(extra?.openTemplate && { openTemplate: "true" }),
            ...(extra?.duplicateFrom && { duplicateFrom: extra.duplicateFrom }),
          },
        }) as const,
      daySchedule: (id: string | number) =>
        ({
          pathname: "/(app)/calendar/day-schedule/[id]",
          params: { id: String(id) },
        }) as const,
      dayScheduleCreate: (date: string) =>
        ({
          pathname: "/(app)/calendar/day-schedule/create",
          params: { date },
        }) as const,
      slot: (id: string | number) =>
        ({
          pathname: "/(app)/calendar/slot/[id]",
          params: { id: String(id) },
        }) as const,
      slotSelectService: (params?: {
        date?: string;
        time?: string;
        appointmentId?: string;
        selectedServiceIds?: string;
      }) =>
        ({
          pathname: "/(app)/calendar/slot/select-service",
          params: params ?? {},
        }) as const,
      slotCreate: () =>
        ({
          pathname: "/(app)/calendar/slot/create",
        }) as const,
    },
    chat: "/(app)/chat",
    clients: {
      root: "/(app)/clients",
      create: "/(app)/clients/create" as const,
      detail: (id: string | number) =>
        ({
          pathname: "/(app)/clients/[id]",
          params: { id: String(id) },
        }) as const,
      statistics: (id: string | number) =>
        ({
          pathname: "/(app)/clients/[id]/statistics",
          params: { id: String(id) },
        }) as const,
      balance: (id: string | number) =>
        ({
          pathname: "/(app)/clients/[id]/balance",
          params: { id: String(id) },
        }) as const,
    },
    menu: {
      schedule: "/(app)/(menu)/schedule",
      notifications: "/(app)/(menu)/notifications",
      finances: "/(app)/(menu)/finances",
      services: {
        root: "/(app)/(menu)/services",
        create: (categoryId?: string | number) =>
          categoryId !== undefined
            ? ({
                pathname: "/(app)/(menu)/services/create",
                params: { categoryId: String(categoryId) },
              } as const)
            : "/(app)/(menu)/services/create",
        categories: "/(app)/(menu)/services/categories" as const,
        additionalServices: {
          root: "/(app)/(menu)/services/additional-services" as const,

          create: "/(app)/(menu)/services/additional-services/create" as const,

          edit: (additionalServiceId: string | number) =>
            ({
              pathname: "/(app)/(menu)/services/additional-services/[id]",
              params: {
                id: String(additionalServiceId),
              },
            }) as const,
        },
        edit: (serviceId: string | number, categoryId?: string | number) =>
          ({
            pathname: "/(app)/(menu)/services/[serviceId]",
            params: {
              serviceId: String(serviceId),
              ...(categoryId !== undefined
                ? { categoryId: String(categoryId) }
                : {}),
            },
          }) as const,
      },

      account: {
        root: "/(app)/(menu)/account" as const,
        personalInformation:
          "/(app)/(menu)/account/personal-information" as const,
        about: "/(app)/(menu)/account/about" as const,
        links: "/(app)/(menu)/account/links" as const,
        booking: "/(app)/(menu)/account/booking" as const,
        notifications: "/(app)/(menu)/account/notifications" as const,
        preview: "/(app)/(menu)/account/preview" as const,
        gallery: "/(app)/(menu)/account/gallery" as const,
        support: "/(app)/(menu)/account/support" as const,
      },
    },
  },
} as const;
