import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { useEffect, useRef, useState } from "react";
import { Platform } from "react-native";

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
    registerForPushNotifications().then((token) => {
      if (token) setExpoPushToken(token);
    });

    // Listener saat notifikasi diterima (app foreground)
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log("Notification received:", notification);
      });

    // Listener saat user tap notifikasi
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("Notification tapped:", response);
        // Bisa navigate ke halaman notifikasi di sini
      });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  return { expoPushToken };
}

async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) {
    console.log("Push notifications hanya jalan di physical device");
    return null;
  }

  // Minta permission
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

  // Dapatkan Expo Push Token
  const token = await Notifications.getExpoPushTokenAsync({
    projectId: "0ad04072-b088-480b-b2de-f2e0d8d12fa6", // dari app.json extra.eas.projectId
  });

  const nativeToken = await Notifications.getDevicePushTokenAsync();

  console.log("NATIVE TOKEN:", nativeToken);
  console.log("EXPO TOKEN: ", token.data);

  // Setup channel untuk Android
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("cow-alerts", {
      name: "Peringatan Sapi",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#D32F2F",
      sound: "default",
    });
  }

  return token.data;
}
