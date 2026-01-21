export const Routers = {
  root: "/",
  auth: {
    root: "/(auth)",
    login: "/(auth)/login",
    register: "/(auth)/register",
  },
} as const;
