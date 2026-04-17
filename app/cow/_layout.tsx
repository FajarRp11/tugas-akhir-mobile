import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useAuthStore } from "@/stores/authStore";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { Stack, router } from "expo-router";
import React, { useState } from "react";
import {
  Appearance,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function CowLayoutHeader() {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const [menuVisible, setMenuVisible] = useState(false);
  const { logout } = useAuthStore();

  const handleSetTheme = (scheme: "light" | "dark" | null) => {
    Appearance.setColorScheme(scheme);
    setMenuVisible(false);
  };

  const handleLogout = () => {
    setMenuVisible(false);
    logout();
  };

  return (
    <View
      style={[
        headerStyles.container,
        {
          paddingTop: insets.top,
          backgroundColor: colorScheme === "dark" ? theme.card : "#FFF",
          borderBottomColor: colorScheme === "dark" ? theme.border : "#F0F0F0",
        },
      ]}
    >
      <View style={headerStyles.headerLeft}>
        <TouchableOpacity
          style={{ marginRight: 16, padding: 4 }}
          onPress={() => router.back()}
        >
          <Feather name="arrow-left" size={24} color={theme.text} />
        </TouchableOpacity>
        <View style={headerStyles.logoCircle}>
          <MaterialCommunityIcons
            name="heart-pulse"
            size={20}
            color="#00BFA5"
          />
        </View>
        <Text style={[headerStyles.headerLogoText, { color: theme.primary }]}>
          Cow Sense
        </Text>
      </View>
      <TouchableOpacity
        onPress={() => setMenuVisible(true)}
        style={headerStyles.settingsBtn}
      >
        <Feather name="settings" size={24} color={theme.primary} />
      </TouchableOpacity>

      <Modal visible={menuVisible} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
          <View style={headerStyles.modalOverlay} />
        </TouchableWithoutFeedback>
        <View
          style={[
            headerStyles.dropdownMenu,
            { top: insets.top + 56, backgroundColor: theme.card },
          ]}
        >
          <Text
            style={[
              headerStyles.dropdownHeader,
              { color: theme.textSecondary },
            ]}
          >
            Pilih Tema
          </Text>
          <TouchableOpacity
            style={headerStyles.dropdownItem}
            onPress={() => handleSetTheme("light")}
          >
            <Feather
              name="sun"
              size={16}
              color={theme.text}
              style={headerStyles.dropdownItemIcon}
            />
            <Text
              style={[headerStyles.dropdownItemText, { color: theme.text }]}
            >
              Terang
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={headerStyles.dropdownItem}
            onPress={() => handleSetTheme("dark")}
          >
            <Feather
              name="moon"
              size={16}
              color={theme.text}
              style={headerStyles.dropdownItemIcon}
            />
            <Text
              style={[headerStyles.dropdownItemText, { color: theme.text }]}
            >
              Gelap
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={headerStyles.dropdownItem}
            onPress={() => handleSetTheme(null)}
          >
            <Feather
              name="smartphone"
              size={16}
              color={theme.text}
              style={headerStyles.dropdownItemIcon}
            />
            <Text
              style={[headerStyles.dropdownItemText, { color: theme.text }]}
            >
              Sistem
            </Text>
          </TouchableOpacity>
          <View
            style={[
              headerStyles.dropdownDivider,
              {
                backgroundColor:
                  colorScheme === "dark" ? theme.border : "#F0F0F0",
              },
            ]}
          />
          <TouchableOpacity
            style={headerStyles.dropdownItem}
            onPress={handleLogout}
          >
            <Feather
              name="log-out"
              size={16}
              color={theme.alert}
              style={headerStyles.dropdownItemIcon}
            />
            <Text
              style={[headerStyles.dropdownItemText, { color: theme.alert }]}
            >
              Logout
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

export default function CowLayout() {
  return (
    <Stack
      screenOptions={{
        header: () => <CowLayoutHeader />,
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: true }} />
      <Stack.Screen name="[id]" options={{ headerShown: true }} />
    </Stack>
  );
}

const headerStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
    paddingTop: 16,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#1A262E",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  headerLogoText: {
    fontFamily: "Manrope-Bold",
    fontSize: 16,
  },
  settingsBtn: {
    padding: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.1)",
  },
  dropdownMenu: {
    position: "absolute",
    right: 24,
    borderRadius: 16,
    padding: 12,
    width: 170,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  dropdownHeader: {
    fontFamily: "Manrope-Bold",
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  dropdownItemIcon: {
    marginRight: 10,
  },
  dropdownItemText: {
    fontFamily: "Manrope-Medium",
    fontSize: 14,
  },
  dropdownDivider: {
    height: 1,
    marginVertical: 4,
  },
});
