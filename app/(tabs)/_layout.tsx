import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React, { useState } from "react";
import {
  Appearance,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HapticTab } from "@/components/haptic-tab";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useAuthStore } from "@/stores/authStore";

function CustomHeader() {
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

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textSecondary,
        headerShown: true,
        header: () => <CustomHeader />,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: theme.card,
          borderTopWidth: 0,
          elevation: 20,
          shadowColor: "#000",
          shadowOpacity: 0.1,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: -5 },
          height: Platform.OS === "ios" ? 90 : 70,
          borderTopLeftRadius: 32,
          borderTopRightRadius: 32,
          position: "absolute",
        },
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Beranda",
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.tabItem]}>
              <MaterialCommunityIcons
                name="home"
                size={20}
                color={focused ? theme.primary : color}
              />
              <Text
                style={[
                  styles.tabLabel,
                  {
                    color: focused ? theme.primary : color,
                    fontFamily: focused ? "Manrope-Bold" : "Manrope-Medium",
                  },
                ]}
              >
                BERANDA
              </Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: "Peta",
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.tabItem]}>
              <Feather
                name="map"
                size={20}
                color={focused ? theme.primary : color}
              />
              <Text
                style={[
                  styles.tabLabel,
                  {
                    color: focused ? theme.primary : color,
                    fontFamily: focused ? "Manrope-Bold" : "Manrope-Medium",
                  },
                ]}
              >
                PETA
              </Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: "Notifikasi",
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.tabItem]}>
              <Feather
                name="bell"
                size={20}
                color={focused ? theme.primary : color}
              />
              <Text
                style={[
                  styles.tabLabel,
                  {
                    color: focused ? theme.primary : color,
                    fontFamily: focused ? "Manrope-Bold" : "Manrope-Medium",
                  },
                ]}
              >
                NOTIFIKASI
              </Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profil",
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.tabItem]}>
              <Feather
                name="user"
                size={20}
                color={focused ? theme.primary : color}
              />
              <Text
                style={[
                  styles.tabLabel,
                  {
                    color: focused ? theme.primary : color,
                    fontFamily: focused ? "Manrope-Bold" : "Manrope-Medium",
                  },
                ]}
              >
                PROFIL
              </Text>
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const headerStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingBottom: 16,
    paddingTop: 16,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1A262E",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  headerLogoText: {
    fontFamily: "Manrope-Bold",
    fontSize: 18,
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

const styles = StyleSheet.create({
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 16,
    borderRadius: 100,
    minWidth: 72,
    marginTop: Platform.OS === "ios" ? 10 : 0,
  },
  tabLabel: {
    fontSize: 9,
    marginTop: 4,
    letterSpacing: 0.5,
    maxWidth: 100,
    textAlign: "center",
  },
});
