import * as Sentry from "@sentry/react-native";

Sentry.init({
  dsn: "https://b13e64266292edbbdee55c4fc07805ba@o4511070792581120.ingest.de.sentry.io/4511501536919632",
  enabled: !__DEV__,
  sendDefaultPii: true,
  enableLogs: false,
});
