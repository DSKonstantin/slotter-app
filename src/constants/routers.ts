export const Routers = {
  root: "/",
  auth: {
    root: "/(auth)",
    login: "/(auth)/login",
    restoreLogin: "/(auth)/restore-login",
    verify: "/(auth)/verify",
    enterCode: "/(auth)/enter-code",
    resetPassword: {
      root: "/(auth)/reset-password",
      verify: "/(auth)/reset-password/verify",
      newPassword: "/(auth)/reset-password/new-password",
    },
  },
  onboarding: {
    root: "/(onboarding)",
    register: "/(onboarding)/register",
    personalName: "/(onboarding)/personalName",
  },
  app: {
    root: "/(app)/(tabs)",
    chat: {
      index: "/(app)/(tabs)/chat" as const,
      room: (id: string | number) =>
        ({
          pathname: "/(app)/chat/[id]",
          params: { id: String(id) },
        }) as const,
    },
    history: {
      root: "/(app)/(tabs)/history" as const,
      slot: (id: string | number) =>
        ({
          pathname: "/(app)/(tabs)/history/slot/[id]",
          params: { id },
        }) as const,
    },
    mySpecialists: "/(app)/mySpecialists" as const,
    account: {
      root: "/(app)/(tabs)/account" as const,
      personalInformation:
        "/(app)/(tabs)/account/personal-information" as const,
      notifications: "/(app)/notifications" as const,
      birthday: "/(app)/(tabs)/account/birthday" as const,
      security: {
        root: "/(app)/(tabs)/account/security" as const,
        changePassword:
          "/(app)/(tabs)/account/security/change-password" as const,
      },
      support: "/(app)/(tabs)/account/support" as const,
    },
  },
} as const;
