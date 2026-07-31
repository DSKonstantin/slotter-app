export const Routers = {
  root: "/",
  resetPassword: {
    root: "/(password-reset)",
    verify: "/(password-reset)/verify",
    newPassword: "/(password-reset)/new-password",
  },
  auth: {
    root: "/(auth)",
    login: "/(auth)/login",
    verify: "/(auth)/verify",
    enterCode: "/(auth)/enter-code",
  },
  onboarding: {
    root: "/(onboarding)",
    register: "/(onboarding)/register",
    personalInformation: "/(onboarding)/personal-information",
    service: "/(onboarding)/service",
    schedule: "/(onboarding)/schedule",
    notification: "/(onboarding)/notification",
    link: "/(onboarding)/link",
  },
  app: {
    root: "/(app)/(tabs)",
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
    },
    client: {
      detail: (
        id: string | number,
        kind: "customer" | "userCustomer" = "userCustomer",
      ) =>
        ({
          pathname: "/(app)/client/[id]",
          params: {
            id: String(id),
            ...(kind === "customer" && { kind: "customer" as const }),
          },
        }) as const,
      history: (
        id: string | number,
        kind: "customer" | "userCustomer" = "userCustomer",
      ) =>
        ({
          pathname: "/(app)/client/[id]/history",
          params: {
            id: String(id),
            ...(kind === "customer" && { kind: "customer" as const }),
          },
        }) as const,
    },
    slot: (id: string | number) =>
      ({
        pathname: "/(app)/slot/[id]",
        params: { id: String(id) },
      }) as const,
    daySchedule: {
      edit: (id: string | number) =>
        ({
          pathname: "/(app)/day-schedule/[id]",
          params: { id: String(id) },
        }) as const,
      create: (date: string) =>
        ({
          pathname: "/(app)/day-schedule/create",
          params: { date },
        }) as const,
    },
    createSlotFlow: {
      selectService: (params?: {
        date?: string;
        time?: string;
        appointmentId?: string;
        selectedServiceIds?: string;
        selectedAdditionalServiceIds?: string;
        mode?: "services" | "additional";
      }) =>
        ({
          pathname: "/(app)/create-slot-flow/select-service",
          params: params ?? {},
        }) as const,
      create: () =>
        ({
          pathname: "/(app)/create-slot-flow/create",
        }) as const,
    },
    createClient: "/(app)/create-client" as const,
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
    },

    schedule: {
      root: "/(app)/(tabs)/schedule" as const,
    },
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
      profileSettings: "/(app)/(tabs)/account/profile-settings" as const,
      aboutMe: "/(app)/(tabs)/account/profile-settings/about-me" as const,
      contacts: "/(app)/(tabs)/account/contacts" as const,
      booking: "/(app)/(tabs)/account/booking" as const,
      bookingConditions:
        "/(app)/(tabs)/account/booking/booking-conditions" as const,
      notifications: "/(app)/(tabs)/account/notifications" as const,
      security: {
        root: "/(app)/(tabs)/account/security" as const,
        changePassword:
          "/(app)/(tabs)/account/security/change-password" as const,
        email: "/(app)/(tabs)/account/security/email" as const,
      },
      preview: "/(app)/(tabs)/account/preview" as const,
      gallery: "/(app)/(tabs)/account/gallery" as const,
      clientNotifications: {
        root: "/(app)/(tabs)/account/client-notifications" as const,
        statistics:
          "/(app)/(tabs)/account/client-notifications/statistics" as const,
        types: "/(app)/(tabs)/account/client-notifications/types" as const,
        reminder:
          "/(app)/(tabs)/account/client-notifications/reminder" as const,
        reschedule:
          "/(app)/(tabs)/account/client-notifications/reschedule" as const,
      },
      support: "/(app)/(tabs)/account/support" as const,
    },
  },
} as const;
