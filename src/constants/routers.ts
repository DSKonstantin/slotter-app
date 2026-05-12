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
              pathname: "/(app)/(tabs)/calendar",
              params: { date, ...(mode && { mode }) },
            } as const)
          : ("/(app)/(tabs)/calendar" as const),
      schedule: (
        date?: string,
        extra?: { openTemplate?: boolean; duplicateFrom?: string },
      ) =>
        ({
          pathname: "/(app)/(tabs)/calendar/schedule",
          params: {
            ...(date && { date }),
            ...(extra?.openTemplate && { openTemplate: "true" }),
            ...(extra?.duplicateFrom && { duplicateFrom: extra.duplicateFrom }),
          },
        }) as const,
      daySchedule: (id: string | number) =>
        ({
          pathname: "/(app)/(tabs)/calendar/day-schedule/[id]",
          params: { id: String(id) },
        }) as const,
      dayScheduleCreate: (date: string) =>
        ({
          pathname: "/(app)/(tabs)/calendar/day-schedule/create",
          params: { date },
        }) as const,
      slot: (id: string | number) =>
        ({
          pathname: "/(app)/(tabs)/calendar/slot/[id]",
          params: { id: String(id) },
        }) as const,
      slotSelectService: (params?: {
        date?: string;
        time?: string;
        appointmentId?: string;
        selectedServiceIds?: string;
        selectedAdditionalServiceIds?: string;
        mode?: "services" | "additional";
      }) =>
        ({
          pathname: "/(app)/(tabs)/calendar/slot/select-service",
          params: params ?? {},
        }) as const,
      slotCreate: () =>
        ({
          pathname: "/(app)/(tabs)/calendar/slot/create",
        }) as const,
      slotClientCreate: "/(app)/(tabs)/calendar/slot/create-client" as const,
      clientDetail: (
        id: string | number,
        kind: "customer" | "userCustomer" = "userCustomer",
      ) =>
        ({
          pathname: "/(app)/(tabs)/calendar/client/[id]",
          params: {
            id: String(id),
            ...(kind === "customer" && { kind: "customer" as const }),
          },
        }) as const,
    },
    chat: {
      index: "/(app)/(tabs)/chat" as const,
      room: (id: string | number) =>
        ({
          pathname: "/(app)/chat/[id]",
          params: { id: String(id) },
        }) as const,
    },
    clients: {
      root: "/(app)/(tabs)/clients",
      create: "/(app)/(tabs)/clients/create" as const,
      statistics: "/(app)/(tabs)/clients/statistics" as const,
      detail: (
        id: string | number,
        kind: "customer" | "userCustomer" = "userCustomer",
      ) =>
        ({
          pathname: "/(app)/(tabs)/clients/[id]",
          params: {
            id: String(id),
            ...(kind === "customer" && { kind: "customer" as const }),
          },
        }) as const,
      history: (id: string | number) =>
        ({
          pathname: "/(app)/(tabs)/clients/[id]/history",
          params: { id: String(id) },
        }) as const,
    },

    schedule: "/(app)/(tabs)/schedule",
    history: {
      root: "/(app)/(tabs)/history" as const,
    },
    finances: {
      root: "/(app)/(tabs)/finances",
      income: "/(app)/(tabs)/finances/income",
    } as const,
    services: {
      root: "/(app)/(tabs)/services",
      create: (categoryId?: string | number) =>
        categoryId !== undefined
          ? ({
              pathname: "/(app)/(tabs)/services/create",
              params: { categoryId: String(categoryId) },
            } as const)
          : "/(app)/(tabs)/services/create",
      categories: "/(app)/(tabs)/services/categories" as const,
      additionalServices: {
        root: "/(app)/(tabs)/services/additional-services" as const,

        create: "/(app)/(tabs)/services/additional-services/create" as const,

        edit: (additionalServiceId: string | number) =>
          ({
            pathname: "/(app)/(tabs)/services/additional-services/[id]",
            params: {
              id: String(additionalServiceId),
            },
          }) as const,
      },
      edit: (serviceId: string | number, categoryId?: string | number) =>
        ({
          pathname: "/(app)/(tabs)/services/[serviceId]",
          params: {
            serviceId: String(serviceId),
            ...(categoryId !== undefined
              ? { categoryId: String(categoryId) }
              : {}),
          },
        }) as const,
    },

    account: {
      root: "/(app)/(tabs)/account" as const,
      personalInformation:
        "/(app)/(tabs)/account/personal-information" as const,
      about: "/(app)/(tabs)/account/about" as const,
      links: "/(app)/(tabs)/account/links" as const,
      booking: "/(app)/(tabs)/account/booking" as const,
      notifications: "/(app)/(tabs)/account/notifications" as const,
      preview: "/(app)/(tabs)/account/preview" as const,
      gallery: "/(app)/(tabs)/account/gallery" as const,
      support: "/(app)/(tabs)/account/support" as const,
    },
  },
} as const;
