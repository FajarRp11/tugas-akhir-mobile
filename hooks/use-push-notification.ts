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
  const debug: any = {};

  try {
    debug.isDevice = Device.isDevice;

    if (!Device.isDevice) {
      Alert.alert("DEBUG", JSON.stringify(debug, null, 2));
      return null;
    }

    const perm1 = await Notifications.getPermissionsAsync();
    debug.existingStatus = perm1.status;

    let finalStatus = perm1.status;

    if (perm1.status !== "granted") {
      const perm2 = await Notifications.requestPermissionsAsync();
      debug.requestStatus = perm2.status;
      finalStatus = perm2.status;
    }

    debug.finalStatus = finalStatus;

    if (finalStatus !== "granted") {
      Alert.alert("DEBUG", JSON.stringify(debug, null, 2));
      return null;
    }

    const token = await Notifications.getExpoPushTokenAsync({
      projectId: "0ad04072-b088-480b-b2de-f2e0d8d12fa6",
    });

    debug.expoToken = token.data;
    Alert.alert("DEBUG", JSON.stringify(debug, null, 2));

    return token.data;
  } catch (e: any) {
    debug.error = e?.message ?? String(e);
    debug.fullError = JSON.stringify(e, null, 2);
    Alert.alert("ERROR TOKEN", JSON.stringify(debug, null, 2));
    return null;
  }
}
