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
    home: {
      root: "/(app)/home",
      services: {
        root: "/(app)/home/services",
        create: "/(app)/home/services/create",
        categories: "/(app)/home/services/categories",
      },
    },
    calendar: {
      root: "/(app)/calendar",
      schedule: "/(app)/calendar/schedule",
      daySchedule: "/(app)/calendar/day-schedule",
    },

    chat: "/(app)/chat",
    clients: "/(app)/clients",
  },
} as const;
