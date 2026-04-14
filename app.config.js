const { expo: baseConfig } = require("./app.json");

const variant =
  process.env.APP_VARIANT || process.env.EXPO_PUBLIC_APP_ENV || "development";

const variantConfig = {
  development: {
    appName: "slotter dev",
    idSuffix: ".dev",
  },
  staging: {
    appName: "slotter staging",
    idSuffix: ".staging",
  },
  production: {
    appName: "slotter",
    idSuffix: "",
  },
};

const currentVariant = variantConfig[variant] || variantConfig.development;
const applicationId = `com.anonymous.slotter${currentVariant.idSuffix}`;

module.exports = {
  expo: {
    ...baseConfig,
    name: currentVariant.appName,
    ios: {
      ...baseConfig.ios,
      bundleIdentifier: applicationId,
    },
    android: {
      ...baseConfig.android,
      package: applicationId,
    },
    extra: {
      ...(baseConfig.extra || {}),
      appVariant: variant,
      apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL || "",
      cableUrl: process.env.EXPO_PUBLIC_CABLE_URL || "",
eas: {
        ...((baseConfig.extra && baseConfig.extra.eas) || {}),
        projectId:
          process.env.EXPO_PUBLIC_EAS_PROJECT_ID ||
          (baseConfig.extra &&
            baseConfig.extra.eas &&
            baseConfig.extra.eas.projectId) ||
          undefined,
      },
    },
  },
};
