import { Colors } from "@/constants/theme";
import { useAuthStore } from "@/stores/authStore";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Dimensions,
  Image,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CAPTURE_CARD_WIDTH = SCREEN_WIDTH * 0.72;

// --- Types ---
interface CameraCapture {
  id: string;
  cameraName: string;
  location: string;
  image: any; // require() returns number
  timestamp: string;
  chickenCount: number;
}

interface DetectionStat {
  label: string;
  value: number;
  unit: string;
  icon: string;
  iconColor: string;
  bgColor: string;
}

// --- Dummy Data ---
const CAMERA_CAPTURE: CameraCapture = {
  id: "cam-1",
  cameraName: "Kamera 1",
  location: "Kandang A-01",
  image: require("@/assets/images/chicken/capture_1.jpg"),
  timestamp: "03 Mei 2026, 16:30",
  chickenCount: 24,
};

// --- Main Component ---
export default function ChickenMonitoringScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];
  const styles = getStyles(theme, colorScheme);
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={["#F57C00"]}
          />
        }
      >
        {/* Greeting */}
        <View style={styles.greetingSection}>
          <Text style={styles.greetingSub}>Selamat pagi,</Text>
          <Text style={styles.pageTitle}>Halo, {user?.name || "Pak Tani"}</Text>
        </View>

        {/* Info Cards */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionHeaderLeft}>
            <View
              style={[styles.sectionMarker, { backgroundColor: "#1976D2" }]}
            />
            <Text style={styles.sectionTitle}>INFORMASI KANDANG</Text>
          </View>
        </View>

        {/* Kandang Info Card 1 */}
        <View style={styles.infoCard}>
          <View style={styles.infoCardHeader}>
            <View style={[styles.infoIconBox, { backgroundColor: "#FFF3E0" }]}>
              <MaterialCommunityIcons
                name="thermometer"
                size={20}
                color="#F57C00"
              />
            </View>
            <View style={styles.infoCardHeaderText}>
              <Text style={styles.infoCardTitle}>Suhu & Kelembapan</Text>
              <Text style={styles.infoCardSub}>Rata-rata semua kandang</Text>
            </View>
          </View>
          <View style={styles.infoMetricsRow}>
            <View style={styles.infoMetric}>
              <Text style={styles.infoMetricValue}>32.5°C</Text>
              <Text style={styles.infoMetricLabel}>Suhu Rata-rata</Text>
            </View>
            <View style={styles.infoMetricDivider} />
            <View style={styles.infoMetric}>
              <Text style={styles.infoMetricValue}>72%</Text>
              <Text style={styles.infoMetricLabel}>Kelembapan</Text>
            </View>
            <View style={styles.infoMetricDivider} />
            <View style={styles.infoMetric}>
              <Text style={[styles.infoMetricValue, { color: "#2E7D32" }]}>
                Normal
              </Text>
              <Text style={styles.infoMetricLabel}>Status</Text>
            </View>
          </View>
        </View>

        {/* Camera Captures Section */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionHeaderLeft}>
            <View
              style={[styles.sectionMarker, { backgroundColor: "#F57C00" }]}
            />
            <Text style={styles.sectionTitle}>HASIL TANGKAPAN KAMERA</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.captureCard} activeOpacity={0.9}>
          {/* Camera Image */}
          <View style={styles.captureImageContainer}>
            <Image
              source={CAMERA_CAPTURE.image}
              style={styles.captureImage}
              resizeMode="cover"
            />
            {/* Overlay Badge */}
            <View style={styles.captureBadge}>
              <MaterialCommunityIcons name="bird" size={12} color="#FFF" />
              <Text style={styles.captureBadgeText}>
                {CAMERA_CAPTURE.chickenCount} Terdeteksi
              </Text>
            </View>
            {/* Camera Label */}
            <View style={styles.cameraLabel}>
              <Feather name="camera" size={10} color="#FFF" />
              <Text style={styles.cameraLabelText}>
                {CAMERA_CAPTURE.cameraName}
              </Text>
            </View>
          </View>
          {/* Card Footer */}
          <View style={styles.captureFooter}>
            <View>
              <Text style={styles.captureLocation}>
                {CAMERA_CAPTURE.location}
              </Text>
              <Text style={styles.captureTime}>{CAMERA_CAPTURE.timestamp}</Text>
            </View>
            <View style={styles.captureArrow}>
              <Feather
                name="chevron-right"
                size={16}
                color={theme.textSecondary}
              />
            </View>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

// --- Styles ---
const getStyles = (theme: any, colorScheme: string) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colorScheme === "dark" ? theme.background : "#F2F5F8",
    },
    scrollContent: {
      paddingBottom: 40,
    },
    greetingSection: {
      marginTop: 24,
      marginBottom: 20,
      paddingHorizontal: 20,
    },
    greetingSub: {
      fontFamily: "Manrope",
      fontSize: 14,
      color: theme.textSecondary,
      marginBottom: 2,
    },
    pageTitle: {
      fontFamily: "Manrope-ExtraBold",
      fontSize: 24,
      color: theme.text,
    },
    // Section Header
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      marginBottom: 14,
    },
    sectionHeaderLeft: {
      flexDirection: "row",
      alignItems: "center",
    },
    sectionMarker: {
      width: 4,
      height: 16,
      borderRadius: 2,
      marginRight: 10,
    },
    sectionTitle: {
      fontFamily: "Manrope-Bold",
      fontSize: 11,
      color: theme.textSecondary,
      letterSpacing: 1,
    },
    // Camera Capture
    captureCard: {
      marginHorizontal: 20,
      backgroundColor: theme.card,
      borderRadius: 20,
      overflow: "hidden",
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOpacity: 0.08,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 4 },
        },
        android: { elevation: 4 },
      }),
    },
    captureImageContainer: {
      width: "100%",
      height: 180,
      position: "relative",
    },
    captureImage: {
      width: "100%",
      height: "100%",
    },
    captureBadge: {
      position: "absolute",
      top: 12,
      right: 12,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "rgba(46, 125, 50, 0.9)",
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 20,
    },
    captureBadgeText: {
      fontFamily: "Manrope-Bold",
      fontSize: 11,
      color: "#FFF",
      marginLeft: 5,
    },
    cameraLabel: {
      position: "absolute",
      bottom: 12,
      left: 12,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "rgba(0,0,0,0.55)",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    cameraLabelText: {
      fontFamily: "Manrope-SemiBold",
      fontSize: 10,
      color: "#FFF",
      marginLeft: 4,
    },
    captureFooter: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 14,
    },
    captureLocation: {
      fontFamily: "Manrope-Bold",
      fontSize: 14,
      color: theme.text,
      marginBottom: 2,
    },
    captureTime: {
      fontFamily: "Manrope-Medium",
      fontSize: 11,
      color: theme.textSecondary,
    },
    captureArrow: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colorScheme === "dark" ? "#333" : "#F5F5F5",
      alignItems: "center",
      justifyContent: "center",
    },
    // Info Cards
    infoCard: {
      backgroundColor: theme.card,
      borderRadius: 20,
      marginHorizontal: 20,
      marginBottom: 14,
      padding: 18,
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOpacity: 0.04,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 2 },
        },
        android: { elevation: 2 },
      }),
    },
    infoCardHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 16,
    },
    infoIconBox: {
      width: 42,
      height: 42,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },
    infoCardHeaderText: {
      flex: 1,
    },
    infoCardTitle: {
      fontFamily: "Manrope-Bold",
      fontSize: 15,
      color: theme.text,
      marginBottom: 2,
    },
    infoCardSub: {
      fontFamily: "Manrope-Medium",
      fontSize: 12,
      color: theme.textSecondary,
    },
    infoMetricsRow: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colorScheme === "dark" ? "#2A2A2A" : "#FAFAFA",
      borderRadius: 14,
      padding: 14,
    },
    infoMetric: {
      flex: 1,
      alignItems: "center",
    },
    infoMetricValue: {
      fontFamily: "Manrope-Bold",
      fontSize: 16,
      color: theme.text,
      marginBottom: 4,
    },
    infoMetricLabel: {
      fontFamily: "Manrope-Medium",
      fontSize: 9,
      color: theme.textSecondary,
      textAlign: "center",
    },
    infoMetricDivider: {
      width: 1,
      height: 30,
      backgroundColor: colorScheme === "dark" ? "#444" : "#E0E0E0",
    },
  });
