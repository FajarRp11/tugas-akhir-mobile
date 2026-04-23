import { Colors } from "@/constants/theme";
import { useAuthStore } from "@/stores/authStore";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function SettingsScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];
  const styles = getStyles(theme, colorScheme);
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();

  // Dummy states for switches
  const [pushNotif, setPushNotif] = useState(true);
  const [anomalyAlert, setAnomalyAlert] = useState(true);
  const [offlineAlert, setOfflineAlert] = useState(true);

  const handleUnderDevelopment = () => {
    Alert.alert(
      "Segera Hadir",
      "Fitur ini masih dalam tahap pengembangan dan akan tersedia pada pembaruan berikutnya."
    );
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header Bar */}
        <View style={styles.headerBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Pengaturan Akun</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Profile Card Header */}
          <View style={styles.profileSummaryContainer}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarInitials}>
                {user?.name ? user.name.substring(0, 2).toUpperCase() : "??"}
              </Text>
            </View>
            <View style={styles.profileTextInfo}>
              <Text style={styles.profileName}>{user?.name}</Text>
              <Text style={styles.profileEmail}>{user?.email}</Text>
              <View style={styles.badgeWrapper}>
                <Text style={styles.badgeText}>Pemilik Utama</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.editProfileBtn} onPress={handleUnderDevelopment}>
              <Feather name="edit-2" size={16} color="#FFF" />
            </TouchableOpacity>
          </View>

          {/* Pengaturan Privasi & Keamanan */}
          <Text style={styles.sectionTitle}>Akun & Keamanan</Text>
          <View style={styles.settingCard}>
            <SettingItem
              icon={<Feather name="user" size={20} color="#1565C0" />}
              iconBg="#E3F2FD"
              title="Informasi Pribadi"
              subtitle="Ubah detail profil dan kontak"
              onPress={handleUnderDevelopment}
              theme={theme}
            />
            <View style={styles.divider} />
            <SettingItem
              icon={<Feather name="lock" size={20} color="#E65100" />}
              iconBg="#FFF3E0"
              title="Ubah Kata Sandi"
              subtitle="Perbarui kata sandi keamanan Anda"
              onPress={handleUnderDevelopment}
              theme={theme}
            />
          </View>

          {/* Pengaturan Notifikasi Peringatan */}
          <Text style={styles.sectionTitle}>Notifikasi Perangkat & IoT</Text>
          <View style={styles.settingCard}>
            <SettingSwitch
              icon={<Feather name="bell" size={20} color="#2E7D32" />}
              iconBg="#E8F5E9"
              title="Notifikasi Sistem"
              subtitle="Terima pemberitahuan aplikasi keseluruhan"
              value={pushNotif}
              onValueChange={setPushNotif}
              theme={theme}
            />
            <View style={styles.divider} />
            <SettingSwitch
              icon={<MaterialIcons name="insights" size={20} color="#D32F2F" />}
              iconBg="#FFEBEE"
              title="Peringatan Anomali Kesehatan"
              subtitle="Detak jantung atau suhu sapi tidak wajar"
              value={anomalyAlert}
              onValueChange={setAnomalyAlert}
              theme={theme}
            />
            <View style={styles.divider} />
            <SettingSwitch
              icon={<Feather name="wifi-off" size={20} color="#E64A19" />}
              iconBg="#FBE9E7"
              title="Peringatan Perangkat Offline"
              subtitle="Saat Smart-Collar kehilangan koneksi"
              value={offlineAlert}
              onValueChange={setOfflineAlert}
              theme={theme}
            />
          </View>

          {/* Lainnya */}
          <Text style={styles.sectionTitle}>Lainnya</Text>
          <View style={styles.settingCard}>
            <SettingItem
              icon={<Feather name="moon" size={20} color="#4527A0" />}
              iconBg="#EDE7F6"
              title="Tema Tampilan"
              subtitle="Mengikuti sistem perangkat (Otomatis)"
              onPress={() => {}}
              theme={theme}
              valueText="Sistem"
            />
            <View style={styles.divider} />
            <SettingItem
              icon={<Feather name="info" size={20} color="#00838F" />}
              iconBg="#E0F7FA"
              title="Tentang Aplikasi"
              subtitle="Smart Cow Monitoring App - v1.0.0"
              onPress={handleUnderDevelopment}
              theme={theme}
            />
          </View>
        </ScrollView>
      </View>
    </>
  );
}

function SettingItem({ icon, iconBg, title, subtitle, onPress, theme, valueText }: any) {
  return (
    <TouchableOpacity style={stylesItem.container} activeOpacity={0.7} onPress={onPress}>
      <View style={[stylesItem.iconContainer, { backgroundColor: iconBg }]}>{icon}</View>
      <View style={stylesItem.textContainer}>
        <Text style={[stylesItem.titleText, { color: theme.text }]}>{title}</Text>
        <Text style={stylesItem.subtitleText}>{subtitle}</Text>
      </View>
      {valueText ? (
        <Text style={[stylesItem.valueText, { color: theme.textSecondary }]}>{valueText}</Text>
      ) : (
        <Feather name="chevron-right" size={20} color={theme.textSecondary} style={{ opacity: 0.5 }} />
      )}
    </TouchableOpacity>
  );
}

function SettingSwitch({ icon, iconBg, title, subtitle, value, onValueChange, theme }: any) {
  return (
    <View style={stylesItem.container}>
      <View style={[stylesItem.iconContainer, { backgroundColor: iconBg }]}>{icon}</View>
      <View style={stylesItem.textContainer}>
        <Text style={[stylesItem.titleText, { color: theme.text }]}>{title}</Text>
        <Text style={stylesItem.subtitleText}>{subtitle}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: "#E0E0E0", true: "#A5D6A7" }}
        thumbColor={value ? "#2E7D32" : "#F5F5F5"}
      />
    </View>
  );
}

const stylesItem = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  textContainer: {
    flex: 1,
    justifyContent: "center",
  },
  titleText: {
    fontFamily: "Manrope-Bold",
    fontSize: 14,
    marginBottom: 4,
  },
  subtitleText: {
    fontFamily: "Manrope-Medium",
    fontSize: 11,
    color: "#78909C",
  },
  valueText: {
    fontFamily: "Manrope-SemiBold",
    fontSize: 13,
  },
});

const getStyles = (theme: any, colorScheme: string) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colorScheme === "dark" ? theme.background : "#F5F7FA",
    },
    headerBar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colorScheme === "dark" ? theme.border : "#EBEBEB",
      backgroundColor: theme.card,
      elevation: 2,
    },
    backBtn: {
      width: 40,
      height: 40,
      justifyContent: "center",
      alignItems: "flex-start",
    },
    headerTitle: {
      fontFamily: "Manrope-Bold",
      fontSize: 18,
      color: theme.text,
    },
    scrollContent: {
      paddingHorizontal: 20,
      paddingTop: 24,
      paddingBottom: Platform.OS === "ios" ? 100 : 80,
    },
    profileSummaryContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.card,
      borderRadius: 24,
      padding: 16,
      marginBottom: 32,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: colorScheme === "dark" ? 0.2 : 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    avatarCircle: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: "#1B5E20",
      alignItems: "center",
      justifyContent: "center",
      marginRight: 16,
    },
    avatarInitials: {
      fontFamily: "Manrope-ExtraBold",
      fontSize: 22,
      color: "#FFF",
      letterSpacing: 1,
    },
    profileTextInfo: {
      flex: 1,
    },
    profileName: {
      fontFamily: "Manrope-ExtraBold",
      fontSize: 18,
      color: theme.text,
      marginBottom: 2,
    },
    profileEmail: {
      fontFamily: "Manrope-Medium",
      fontSize: 12,
      color: theme.textSecondary,
      marginBottom: 8,
    },
    badgeWrapper: {
      alignSelf: "flex-start",
      backgroundColor: "#E8F5E9",
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
    },
    badgeText: {
      fontFamily: "Manrope-Bold",
      fontSize: 10,
      color: "#2E7D32",
    },
    editProfileBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: "#4CAF50",
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#4CAF50",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 2,
    },
    sectionTitle: {
      fontFamily: "Manrope-Bold",
      fontSize: 13,
      color: theme.textSecondary,
      marginLeft: 8,
      marginBottom: 10,
      textTransform: "uppercase",
      letterSpacing: 1,
    },
    settingCard: {
      backgroundColor: theme.card,
      borderRadius: 20,
      marginBottom: 24,
      overflow: "hidden",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: colorScheme === "dark" ? 0.2 : 0.04,
      shadowRadius: 6,
      elevation: 1,
    },
    divider: {
      height: 1,
      backgroundColor: colorScheme === "dark" ? theme.border : "#F0F4F8",
      marginLeft: 70, /* aligns with text to skip icon */
    },
  });
