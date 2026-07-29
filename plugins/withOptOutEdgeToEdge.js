const { withAndroidStyles, AndroidConfig } = require("@expo/config-plugins");

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
