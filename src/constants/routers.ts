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
      root: "/(app)/calendar",
      schedule: "/(app)/calendar/schedule",
      daySchedule: "/(app)/calendar/day-schedule",
    },
    chat: "/(app)/chat",
    clients: "/(app)/clients",
    menu: {
      schedule: "/(app)/(menu)/schedule",
      notifications: "/(app)/(menu)/notifications",
      finances: "/(app)/(menu)/finances",
      services: {
        root: "/(app)/(menu)/services",
        create: "/(app)/(menu)/services/create",
        categories: "/(app)/(menu)/services/categories",
        edit: (serviceId: string | number) => ({
          pathname: "/(app)/(menu)/services/[serviceId]",
          params: { serviceId: String(serviceId) },
        }),
        categoryEdit: (categoryId: string | number) => ({
          pathname: "/(app)/(menu)/services/categories/[categoryId]",
          params: { categoryId: String(categoryId) },
        }),
      },
      account: "/(app)/(menu)/account",
    },
  },
} as const;
