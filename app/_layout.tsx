import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import {
  router,
  Stack,
  useRootNavigationState,
  useSegments,
} from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { useAuthStore } from "@/stores/authStore";
import {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
  useFonts,
} from "@expo-google-fonts/manrope";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useEffect, useState } from "react";

// Notifications.setNotificationHandler({
//   handleNotification: async () => ({
//     shouldShowAlert: true,
//     shouldPlaySound: true,
//     shouldSetBadge: false,
//     shouldShowBanner: true,
//     shouldShowList: true,
//   }),
// });

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { token, loadAuth } = useAuthStore();
  const segments = useSegments();
  const rootNavigationState = useRootNavigationState();
  const [isAuthLoaded, setIsAuthLoaded] = useState(false);

  const [fontsLoaded] = useFonts({
    Manrope: Manrope_400Regular,
    "Manrope-Medium": Manrope_500Medium,
    "Manrope-SemiBold": Manrope_600SemiBold,
    "Manrope-Bold": Manrope_700Bold,
    "Manrope-ExtraBold": Manrope_800ExtraBold,
    ...MaterialCommunityIcons.font,
    ...Feather.font,
  });

  useEffect(() => {
    const init = async () => {
      // Meminta pop-up lokasi saat aplikasi pertama kali dilaunch
      try {
        await Location.requestForegroundPermissionsAsync();
      } catch (e) {
        /* Abaikan bila perangkat menolak secara mendadak */
      }
      await loadAuth();
      setIsAuthLoaded(true);
    };
    init();
  }, []);

  useEffect(() => {
    if (!isAuthLoaded || !rootNavigationState?.key) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (token && inAuthGroup) {
      router.replace("/(tabs)");
    } else if (!token && !inAuthGroup) {
      router.replace("/(auth)/login");
    }
  }, [token, segments, isAuthLoaded, rootNavigationState?.key]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="cow" options={{ headerShown: false }} />
        <Stack.Screen name="management" options={{ headerShown: false }} />
        <Stack.Screen
          name="modal"
          options={{ presentation: "modal", title: "Modal" }}
        />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
