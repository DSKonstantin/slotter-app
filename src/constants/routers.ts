export const Routers = {
  root: "/",
  auth: {
    root: "/(auth)",
    login: "/(auth)/login",
    restoreLogin: "/(auth)/restore-login",
    verify: "/(auth)/verify",
    enterCode: "/(auth)/enter-code",
    register: "/(auth)/register",
    experience: "/(auth)/experience",
    database: "/(auth)/database",
    databaseSuccess: "/(auth)/database-success",
    personalInformation: "/(auth)/personal-information",
    service: "/(auth)/service",
    schedule: "/(auth)/schedule",
    notification: "/(auth)/notification",
    link: "/(auth)/link",
  },
  tabs: {
    home: "/(tabs)/home",
    calendar: {
      root: "/(tabs)/calendar",
      schedule: "/(tabs)/calendar/schedule",
      daySchedule: "/(tabs)/calendar/day-schedule",
    },
    chat: "/(tabs)/chat",
    clients: "/(tabs)/clients",
  },
} as const;
