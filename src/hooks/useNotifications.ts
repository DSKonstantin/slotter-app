// import { useEffect, useRef, useState } from "react";
// import * as Notifications from "expo-notifications";
// import { registerForPushNotificationsAsync } from "@/src/utils/notifications";
//
// export function useNotifications() {
//   const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
//   const [notification, setNotification] =
//     useState<Notifications.Notification | null>(null);
//
//   const receivedListener = useRef();
//   const responseListener = useRef();
//
//   useEffect(() => {
//     registerForPushNotificationsAsync().then(setExpoPushToken);
//
//     receivedListener.current = Notifications.addNotificationReceivedListener(
//       (n) => {
//         setNotification(n);
//       },
//     );
//
//     responseListener.current =
//       Notifications.addNotificationResponseReceivedListener((r) => {
//         console.log("notification click:", r);
//       });
//
//     return () => {
//       receivedListener.current?.remove();
//       responseListener.current?.remove();
//     };
//   }, []);
//
//   return { expoPushToken, notification };
// }
