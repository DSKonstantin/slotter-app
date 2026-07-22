const { withAndroidStyles, AndroidConfig } = require("@expo/config-plugins");

// Опт-аут из принудительного edge-to-edge на Android 15 (API 35).
// ВАЖНО: атрибут игнорируется системой при targetSdkVersion >= 36.
module.exports = function withOptOutEdgeToEdge(config) {
  return withAndroidStyles(config, (config) => {
    config.modResults = AndroidConfig.Styles.assignStylesValue(
      config.modResults,
      {
        add: true,
        parent: AndroidConfig.Styles.getAppThemeGroup(),
        name: "android:windowOptOutEdgeToEdgeEnforcement",
        value: "true",
      },
    );
    return config;
  });
};
