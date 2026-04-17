import { Colors } from "@/constants/theme";
import { useDashboard } from "@/hooks/use-dashboard";
import { useAuthStore } from "@/stores/authStore";
import { SensorReading } from "@/types";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

function getAnomalyDescription(reading: SensorReading): string {
  const issues: string[] = [];
  if (reading.temperature) {
    if (reading.temperature > 39.5) issues.push("Suhu tubuh terlalu tinggi");
    if (reading.temperature < 38.0) issues.push("Suhu tubuh terlalu rendah");
  }
  if (reading.heartRate) {
    if (reading.heartRate > 80) issues.push("Detak jantung terlalu tinggi");
    if (reading.heartRate < 60) issues.push("Detak jantung terlalu rendah");
  }
  if (reading.spo2 && reading.spo2 < 95) {
    issues.push("Kadar oksigen rendah");
  }
  return issues.join(", ") || "Data anomali terdeteksi";
}

export default function HomeScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];
  const styles = getStyles(theme, colorScheme);
  const { user } = useAuthStore();
  const { totalCows, anomalies, isLoading, error, refresh } = useDashboard();

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refresh}
            colors={[theme.primary]}
          />
        }
      >
        <View style={styles.greetingSection}>
          <Text style={styles.greetingSub}>
            SELAMAT DATANG, {user?.name.toUpperCase()}
          </Text>
          <Text style={styles.pageTitle}>Ringkasan Peternakan</Text>
        </View>

        {/* Main Dashboard Cards */}
        <TouchableOpacity
          style={styles.mainCard}
          activeOpacity={0.8}
          onPress={() => router.push("/cow" as any)}
        >
          <View style={[styles.mainCardIconBg, { backgroundColor: "#DDF7E3" }]}>
            <MaterialCommunityIcons name="cow" size={32} color="#4CAF50" />
          </View>
          <Text style={styles.mainCardTitle}>Monitoring Kesehatan Sapi</Text>
          <Text style={styles.mainCardDesc}>
            Pantau statistik vital dan aktivitas harian ternak sapi Anda.
          </Text>
          <View style={styles.mainCardLinkRow}>
            <Text style={[styles.mainCardLink, { color: theme.primary }]}>
              Buka Dashboard
            </Text>
            <Feather
              name="arrow-right"
              size={16}
              color={theme.primary}
              style={styles.linkIcon}
            />
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.mainCard} activeOpacity={0.8}>
          <View style={[styles.mainCardIconBg, { backgroundColor: "#FFE0B2" }]}>
            <MaterialCommunityIcons
              name="egg-fried"
              size={32}
              color="#F57C00"
            />
          </View>
          <Text style={styles.mainCardTitle}>Monitoring Kesehatan Ayam</Text>
          <Text style={styles.mainCardDesc}>
            Analisis populasi unggas dan kondisi lingkungan kandang.
          </Text>
          <View style={styles.mainCardLinkRow}>
            <Text style={[styles.mainCardLink, { color: "#F57C00" }]}>
              Buka Dashboard
            </Text>
            <Feather
              name="arrow-right"
              size={16}
              color="#F57C00"
              style={styles.linkIcon}
            />
          </View>
        </TouchableOpacity>

        {/* Data Ayam Section */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionHeaderLeft}>
            <View
              style={[styles.sectionMarker, { backgroundColor: "#8D6E24" }]}
            />
            <Text style={styles.sectionTitle}>Data Ayam</Text>
          </View>
          <TouchableOpacity
            style={[styles.badgeBtn, { backgroundColor: "#FDF3E3" }]}
          >
            <Text style={[styles.badgeBtnText, { color: "#8D6E24" }]}>
              Lihat Semua
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.dataCard}>
          <View style={styles.dataCardHeaderRow}>
            <View style={styles.urgentBadge}>
              <Text style={styles.urgentBadgeText}>MENDESAK</Text>
            </View>
            <MaterialCommunityIcons
              name="virus-outline"
              size={24}
              color="#D32F2F"
            />
          </View>
          <Text style={styles.dataCardTitle}>Data Terbaru Ayam yang Sakit</Text>
          <View style={styles.dataCardNumberRow}>
            <Text style={styles.dataCardNumber}>12</Text>
            <Text style={styles.dataCardSubText}>Ekor Teridentifikasi</Text>
          </View>
          <View style={styles.divider} />
          <Text style={styles.dataCardFooter}>
            Terakhir diperbarui: 5 menit yang lalu
          </Text>
        </View>

        <View style={styles.dataCard}>
          <View style={styles.dataCardIconRow}>
            <View
              style={[styles.squareIconBox, { backgroundColor: "#FFE0B2" }]}
            >
              <Feather name="bar-chart-2" size={20} color="#E65100" />
            </View>
            <Text style={styles.dataCardTitleInline}>Data Anomali Terbaru</Text>
          </View>

          <View style={styles.anomalyItem}>
            <Text style={styles.anomalyText}>Suhu Kandang C-04</Text>
            <View style={[styles.valueBadge, { backgroundColor: "#A67B43" }]}>
              <Text style={styles.valueBadgeTextWhite}>+2.4°C</Text>
            </View>
          </View>
          <View style={styles.anomalyItem}>
            <Text style={styles.anomalyText}>Konsumsi Pakan Rendah</Text>
            <View style={[styles.valueBadge, { backgroundColor: "#A67B43" }]}>
              <Text style={styles.valueBadgeTextWhite}>-15%</Text>
            </View>
          </View>
        </View>

        {/* Data Sapi Section */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionHeaderLeft}>
            <View
              style={[styles.sectionMarker, { backgroundColor: "#1B5E20" }]}
            />
            <Text style={styles.sectionTitle}>Data Sapi</Text>
          </View>
          <TouchableOpacity
            style={[styles.badgeBtn, { backgroundColor: "#E8F5E9" }]}
          >
            <Text style={[styles.badgeBtnText, { color: "#2E7D32" }]}>
              Lihat Semua
            </Text>
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <ActivityIndicator
            color={theme.primary}
            style={{ marginVertical: 20 }}
          />
        ) : error ? (
          <View style={styles.dataCard}>
            <Text style={{ color: theme.alert, textAlign: "center" }}>
              {error}
            </Text>
          </View>
        ) : anomalies.length === 0 ? (
          <View style={styles.dataCard}>
            <Text style={{ textAlign: "center", color: theme.textSecondary }}>
              Tidak ada anomali terdeteksi 🎉
            </Text>
          </View>
        ) : (
          anomalies.map((item) => (
            <View key={item.id} style={[styles.dataCard, { marginBottom: 16 }]}>
              <View style={styles.sapiListRow}>
                <View
                  style={[styles.sapiAvatar, { backgroundColor: "#424242" }]}
                >
                  <MaterialCommunityIcons name="cow" size={32} color="#FFF" />
                </View>
                <View style={styles.sapiTextCol}>
                  <View style={styles.sapiIdRow}>
                    <Text style={styles.sapiCardTitle}>Data Anomali Sapi</Text>
                    <View
                      style={[styles.idBadge, { backgroundColor: "#A5D6A7" }]}
                    >
                      <Text style={styles.idBadgeText}>
                        {item.device?.cow?.name ?? item.deviceId}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.sapiDesc}>
                    {getAnomalyDescription(item)}
                  </Text>
                  <Text style={[styles.dataCardFooter, { marginTop: 4 }]}>
                    {new Date(item.createdAt).toLocaleString("id-ID")}
                  </Text>
                  <View style={styles.actionRow}>
                    <View style={styles.redDot} />
                    <Text style={styles.actionText}>PERLU TINDAKAN</Text>
                  </View>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const getStyles = (theme: any, colorScheme: string) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colorScheme === "dark" ? theme.background : "#F7F9FA",
    },
    scrollContent: {
      paddingHorizontal: 24,
      paddingTop: 24,
      paddingBottom: Platform.OS === "ios" ? 110 : 90,
    },
    greetingSection: {
      marginBottom: 24,
    },
    greetingSub: {
      fontFamily: "Manrope-Bold",
      fontSize: 12,
      color: theme.primary,
      letterSpacing: 0.5,
      marginBottom: 8,
    },
    pageTitle: {
      fontFamily: "Manrope-ExtraBold",
      fontSize: 26,
      color: colorScheme === "dark" ? theme.text : "#0B1D28",
      letterSpacing: -0.5,
    },
    mainCard: {
      backgroundColor: theme.card,
      borderRadius: 32,
      padding: 24,
      marginBottom: 20,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.05,
      shadowRadius: 10,
      elevation: 2,
    },
    mainCardIconBg: {
      width: 56,
      height: 56,
      borderRadius: 28,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 16,
    },
    mainCardTitle: {
      fontFamily: "Manrope-Bold",
      fontSize: 17,
      color: colorScheme === "dark" ? theme.text : "#1A262E",
      marginBottom: 8,
    },
    mainCardDesc: {
      fontFamily: "Manrope-Medium",
      fontSize: 13,
      color: theme.textSecondary,
      lineHeight: 20,
      marginBottom: 16,
    },
    mainCardLinkRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    mainCardLink: {
      fontFamily: "Manrope-Bold",
      fontSize: 13,
    },
    linkIcon: {
      marginLeft: 4,
      marginTop: 2,
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: 16,
      marginBottom: 16,
    },
    sectionHeaderLeft: {
      flexDirection: "row",
      alignItems: "center",
    },
    sectionMarker: {
      width: 4,
      height: 20,
      borderRadius: 4,
      marginRight: 10,
    },
    sectionTitle: {
      fontFamily: "Manrope-Bold",
      fontSize: 18,
      color: colorScheme === "dark" ? theme.text : "#1A262E",
    },
    badgeBtn: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 100,
    },
    badgeBtnText: {
      fontFamily: "Manrope-Bold",
      fontSize: 11,
    },
    dataCard: {
      backgroundColor: theme.card,
      borderRadius: 24,
      padding: 20,
      marginBottom: 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.03,
      shadowRadius: 8,
      elevation: 2,
    },
    dataCardHeaderRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    urgentBadge: {
      backgroundColor: "#FFEBEE",
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 100,
    },
    urgentBadgeText: {
      fontFamily: "Manrope-Bold",
      fontSize: 10,
      color: "#D32F2F",
    },
    dataCardTitle: {
      fontFamily: "Manrope-Bold",
      fontSize: 16,
      color: colorScheme === "dark" ? theme.text : "#1A262E",
      marginBottom: 12,
    },
    dataCardNumberRow: {
      flexDirection: "row",
      alignItems: "baseline",
    },
    dataCardNumber: {
      fontFamily: "Manrope-ExtraBold",
      fontSize: 36,
      color: colorScheme === "dark" ? theme.text : "#1A262E",
      marginRight: 8,
    },
    dataCardSubText: {
      fontFamily: "Manrope-Medium",
      fontSize: 14,
      color: theme.textSecondary,
    },
    divider: {
      height: 1,
      backgroundColor: colorScheme === "dark" ? theme.border : "#F0F0F0",
      marginVertical: 16,
    },
    dataCardFooter: {
      fontFamily: "Manrope-Medium",
      fontSize: 11,
      fontStyle: "italic",
      color: theme.textSecondary,
    },
    dataCardIconRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 20,
    },
    squareIconBox: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },
    dataCardTitleInline: {
      fontFamily: "Manrope-Bold",
      fontSize: 16,
      color: colorScheme === "dark" ? theme.text : "#1A262E",
    },
    anomalyItem: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: colorScheme === "dark" ? "#2A2A2A" : "#F4F6F8",
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderRadius: 16,
      marginBottom: 10,
    },
    anomalyText: {
      fontFamily: "Manrope-Medium",
      fontSize: 13,
      color: colorScheme === "dark" ? theme.text : "#1E1E1E",
    },
    valueBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 100,
    },
    valueBadgeTextWhite: {
      fontFamily: "Manrope-Bold",
      fontSize: 12,
      color: "#FFF",
    },
    sapiListRow: {
      flexDirection: "row",
      alignItems: "flex-start",
    },
    sapiAvatar: {
      width: 70,
      height: 70,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 16,
    },
    sapiTextCol: {
      flex: 1,
    },
    sapiIdRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      flexWrap: "wrap",
      marginBottom: 6,
    },
    sapiCardTitle: {
      fontFamily: "Manrope-Bold",
      fontSize: 15,
      color: colorScheme === "dark" ? theme.text : "#1A262E",
      marginRight: 8,
    },
    idBadge: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 100,
      marginTop: 2,
    },
    idBadgeText: {
      fontFamily: "Manrope-Bold",
      fontSize: 9,
      color: "#0B5345",
    },
    sapiDesc: {
      fontFamily: "Manrope-Medium",
      fontSize: 12,
      color: theme.textSecondary,
      lineHeight: 18,
      marginBottom: 12,
    },
    actionRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    redDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: "#D32F2F",
      marginRight: 6,
    },
    actionText: {
      fontFamily: "Manrope-Bold",
      fontSize: 10,
      color: "#D32F2F",
    },
  });
