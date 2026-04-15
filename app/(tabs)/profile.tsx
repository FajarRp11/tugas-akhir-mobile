import { Colors } from "@/constants/theme";
import { useAuthStore } from "@/stores/authStore";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { getCows, getDevices } from "@/services/api";

interface ProfileStat {
  value: number;
  label: string;
}

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  iconBg: string;
  onPress?: () => void;
}

function MenuItem({ icon, label, iconBg, onPress }: MenuItemProps) {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];
  const styles = getStyles(theme, colorScheme);

  return (
    <TouchableOpacity style={styles.menuItem} activeOpacity={0.7} onPress={onPress}>
      <View style={[styles.menuIconCircle, { backgroundColor: iconBg }]}>
        {icon}
      </View>
      <Text style={styles.menuLabel}>{label}</Text>
      <Feather name="chevron-right" size={18} color={theme.textSecondary} />
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];
  const styles = getStyles(theme, colorScheme);
  const { user, logout } = useAuthStore();
  const [stats, setStats] = useState<{ cows: number; devices: number }>({ cows: 0, devices: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [cowsRes, devicesRes] = await Promise.all([getCows(), getDevices()]);
        const activeDev = devicesRes.data.data.filter((d) => d.isActive).length;
        setStats({ cows: cowsRes.data.data.length, devices: activeDev });
      } catch {
        // fail silently
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Avatar & Info */}
      <View style={styles.profileHeader}>
        <View style={styles.avatarWrapper}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitials}>
              {user?.name ? getInitials(user.name) : "??"}
            </Text>
          </View>
          <View style={styles.avatarBadge}>
            <Feather name="check" size={10} color="#FFF" />
          </View>
        </View>
        <Text style={styles.profileName}>{user?.name ?? "—"}</Text>
        <Text style={styles.profileEmail}>{user?.email ?? "—"}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleBadgeText}>PEMILIK UTAMA</Text>
        </View>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        {isLoading ? (
          <ActivityIndicator color={theme.primary} style={{ flex: 1, paddingVertical: 20 }} />
        ) : (
          <>
            <View style={[styles.statCard, { marginRight: 12 }]}>
              <Text style={styles.statValue}>{stats.cows}</Text>
              <Text style={styles.statLabel}>TOTAL SAPI</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.devices}</Text>
              <Text style={styles.statLabel}>PERANGKAT AKTIF</Text>
            </View>
          </>
        )}
      </View>

      {/* Menu List */}
      <View style={styles.menuCard}>
        <MenuItem
          icon={<MaterialCommunityIcons name="cow" size={18} color="#2E7D32" />}
          label="Daftar Sapi Saya"
          iconBg="#E8F5E9"
        />
        <View style={styles.menuDivider} />
        <MenuItem
          icon={<MaterialCommunityIcons name="access-point" size={18} color="#2E7D32" />}
          label="Kelola Perangkat"
          iconBg="#E8F5E9"
        />
        <View style={styles.menuDivider} />
        <MenuItem
          icon={<Feather name="settings" size={18} color="#E65100" />}
          label="Pengaturan Akun"
          iconBg="#FFF3E0"
        />
        <View style={styles.menuDivider} />
        <MenuItem
          icon={<Feather name="help-circle" size={18} color="#1565C0" />}
          label="Pusat Bantuan"
          iconBg="#E3F2FD"
        />
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutBtn} activeOpacity={0.8} onPress={() => logout()}>
        <Feather name="log-out" size={18} color="#FFF" style={{ marginRight: 10 }} />
        <Text style={styles.logoutBtnText}>Keluar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const getStyles = (theme: any, colorScheme: string) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colorScheme === "dark" ? theme.background : "#F5F7FA",
    },
    scrollContent: {
      paddingHorizontal: 24,
      paddingTop: 32,
      paddingBottom: Platform.OS === "ios" ? 120 : 100,
    },

    // --- Profile Header ---
    profileHeader: {
      alignItems: "center",
      marginBottom: 28,
    },
    avatarWrapper: {
      position: "relative",
      marginBottom: 16,
    },
    avatarCircle: {
      width: 88,
      height: 88,
      borderRadius: 44,
      backgroundColor: "#1A262E",
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 3,
      borderColor: colorScheme === "dark" ? theme.border : "#E8F5E9",
    },
    avatarInitials: {
      fontFamily: "Manrope-ExtraBold",
      fontSize: 30,
      color: "#FFFFFF",
      letterSpacing: 1,
    },
    avatarBadge: {
      position: "absolute",
      bottom: 4,
      right: 4,
      width: 22,
      height: 22,
      borderRadius: 11,
      backgroundColor: "#4CAF50",
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 2,
      borderColor: colorScheme === "dark" ? theme.background : "#F5F7FA",
    },
    profileName: {
      fontFamily: "Manrope-ExtraBold",
      fontSize: 22,
      color: colorScheme === "dark" ? theme.text : "#1A262E",
      marginBottom: 4,
    },
    profileEmail: {
      fontFamily: "Manrope-Medium",
      fontSize: 13,
      color: theme.textSecondary,
      marginBottom: 12,
    },
    roleBadge: {
      backgroundColor: colorScheme === "dark" ? "#1B5E20" : "#E8F5E9",
      paddingHorizontal: 16,
      paddingVertical: 5,
      borderRadius: 100,
    },
    roleBadgeText: {
      fontFamily: "Manrope-Bold",
      fontSize: 11,
      color: "#2E7D32",
      letterSpacing: 0.5,
    },

    // --- Stats Row ---
    statsRow: {
      flexDirection: "row",
      marginBottom: 24,
    },
    statCard: {
      flex: 1,
      backgroundColor: theme.card,
      borderRadius: 20,
      paddingVertical: 20,
      paddingHorizontal: 16,
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    statValue: {
      fontFamily: "Manrope-ExtraBold",
      fontSize: 32,
      color: colorScheme === "dark" ? theme.text : "#1A262E",
      marginBottom: 4,
    },
    statLabel: {
      fontFamily: "Manrope-Bold",
      fontSize: 10,
      color: theme.textSecondary,
      letterSpacing: 0.5,
      textAlign: "center",
    },

    // --- Menu Card ---
    menuCard: {
      backgroundColor: theme.card,
      borderRadius: 24,
      paddingVertical: 4,
      paddingHorizontal: 4,
      marginBottom: 24,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 8,
      elevation: 2,
    },
    menuItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderRadius: 20,
    },
    menuIconCircle: {
      width: 38,
      height: 38,
      borderRadius: 19,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 14,
    },
    menuLabel: {
      flex: 1,
      fontFamily: "Manrope-SemiBold",
      fontSize: 15,
      color: colorScheme === "dark" ? theme.text : "#1A262E",
    },
    menuDivider: {
      height: 1,
      backgroundColor: colorScheme === "dark" ? theme.border : "#F0F4F8",
      marginHorizontal: 16,
    },

    // --- Logout Button ---
    logoutBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#D32F2F",
      borderRadius: 16,
      paddingVertical: 16,
      shadowColor: "#D32F2F",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    logoutBtnText: {
      fontFamily: "Manrope-Bold",
      fontSize: 16,
      color: "#FFFFFF",
    },
  });
