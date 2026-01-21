export const Routers = {
  public: {
    root: "/",
  },

  auth: {
    modal: {
      root: "/(auth)/",
      confirm: "/(auth)/confirm",
      success: "/(auth)/success",
    },
  },

  client: {
    root: "/(client)",
    home: "/(client)/home",
    profile: "/(client)/profile",
  },
} as const;
