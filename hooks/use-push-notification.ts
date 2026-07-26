import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { useEffect, useRef, useState } from "react";
import { Alert } from "react-native";

// Konfigurasi tampilan notifikasi saat app foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export function usePushNotification() {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const notificationListener = useRef<any>(null);
  const responseListener = useRef<any>(null);

  useEffect(() => {
    (async () => {
      try {
        const token = await registerForPushNotifications();
        Alert.alert("HOOK", token ?? "NULL");

        if (token) {
          setExpoPushToken(token);
        }
      } catch (e) {
        Alert.alert("HOOK ERROR", String(e));
      }
    })();
  }, []);

  return { expoPushToken };
}

async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) {
    console.log("Push notifications hanya jalan di physical device");
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.log("Permission push notification ditolak!");
    return null;
  }

  try {
    const token = await Notifications.getExpoPushTokenAsync({
      projectId: "0ad04072-b088-480b-b2de-f2e0d8d12fa6",
    });

    console.log("EXPO TOKEN:", token.data);

    return token.data;
  } catch (e) {
    console.log("Gagal ambil Expo Push Token:", e);
    return null;
  }
}
