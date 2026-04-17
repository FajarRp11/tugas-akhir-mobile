import { Colors } from "@/constants/theme";
import { getSensorData } from "@/services/api";
import { useAuthStore } from "@/stores/authStore";
import { SensorReading } from "@/types";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type CowStatus = "SEHAT" | "PERINGATAN" | "KRITIS";

interface CowListItem {
  id: string; // deviceId
  name: string;
  status: CowStatus;
  updatedAt: Date;
}

function getStatus(reading: SensorReading): CowStatus {
  const temperature =
    reading.temperature != null ? Number(reading.temperature) : null;
  const heartRate =
    reading.heartRate != null ? Number(reading.heartRate) : null;
  const spo2 = reading.spo2 != null ? Number(reading.spo2) : null;

  if (
    (temperature && temperature > 40) ||
    (heartRate && heartRate > 90) ||
    (spo2 && spo2 < 90)
  )
    return "KRITIS";
  if (
    (temperature && (temperature > 39.5 || temperature < 38.0)) ||
    (heartRate && (heartRate > 80 || heartRate < 55)) ||
    (spo2 && spo2 < 95)
  )
    return "PERINGATAN";
  return "SEHAT";
}

function getTimeAgo(date: Date) {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  if (seconds < 60) return `${Math.max(1, seconds)} detik yang lalu`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} menit yang lalu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} jam yang lalu`;
  const days = Math.floor(hours / 24);
  return `${days} hari yang lalu`;
}

const STATUS_CONFIG: Record<
  CowStatus,
  { bg: string; text: string; dot: string }
> = {
  SEHAT: { bg: "#A5D6A7", text: "#1B5E20", dot: "#1B5E20" },
  PERINGATAN: { bg: "#FFCDD2", text: "#F9A825", dot: "#F9A825" },
  KRITIS: { bg: "#FFE0B2", text: "#D32F2F", dot: "#D32F2F" },
};

export default function CowMonitoringScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];
  const styles = getStyles(theme, colorScheme);
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();

  const [cows, setCows] = useState<CowListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await getSensorData();
      const readings: SensorReading[] = res.data.data;

      const latestByDevice = new Map<string, SensorReading>();
      for (const r of readings) {
        if (!latestByDevice.has(r.deviceId)) {
          latestByDevice.set(r.deviceId, r);
        }
      }

      const cowList: CowListItem[] = Array.from(latestByDevice.values()).map(
        (r) => ({
          id: r.deviceId,
          name: r.device?.cow?.name ?? r.deviceId,
          status: getStatus(r),
          updatedAt: new Date(r.createdAt),
        }),
      );

      setCows(
        cowList.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()),
      );
    } catch (e) {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const activeDevices = cows.length;
  const warnings = cows.filter((c) => c.status !== "SEHAT").length;

  return (
    <View style={[styles.container]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={fetchData}
            colors={[theme.primary]}
          />
        }
      >
        <View style={styles.greetingSection}>
          <Text style={styles.greetingSub}>Selamat pagi,</Text>
          <Text style={styles.pageTitle}>Halo, {user?.name || "Pak Tani"}</Text>
        </View>

        <View style={styles.totalCard}>
          <View style={styles.watermarkContainer}>
            <MaterialCommunityIcons
              name="paw"
              size={120}
              color={colorScheme === "dark" ? "#2A2A2A" : "#F5F5F5"}
            />
          </View>
          <Text style={styles.totalCardLabel}>TOTAL SAPI</Text>
          <View style={styles.totalCardValueRow}>
            <Text style={styles.totalCardValue}>{cows.length || 0}</Text>
            <Text style={styles.totalCardUnit}>Ekor</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCardLeft}>
            <View style={styles.statIconBoxGreen}>
              <Feather name="radio" size={20} color="#4CAF50" />
            </View>
            <Text style={styles.statLabel}>PERANGKAT</Text>
            <View style={styles.statValueRow}>
              <Text style={styles.statValue}>{activeDevices}</Text>
              <Text style={styles.statUnit}>Aktif</Text>
            </View>
          </View>

          <View style={styles.statCardRight}>
            <View style={styles.statIconBoxRed}>
              <Feather name="alert-triangle" size={20} color="#FFF" />
            </View>
            <Text style={styles.statLabelRed}>PERINGATAN</Text>
            <View style={styles.statValueRow}>
              <Text style={styles.statValueRed}>{warnings}</Text>
              <Text style={styles.statUnitRed}>Hari Ini</Text>
            </View>
          </View>
        </View>

        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>Daftar Sapi</Text>
          <TouchableOpacity onPress={() => router.push("/(tabs)/map")}>
            <Text style={[styles.listShowAll, { color: theme.primary }]}>
              Lihat di Peta
            </Text>
          </TouchableOpacity>
        </View>

        {isLoading && cows.length === 0 ? (
          <ActivityIndicator
            size="large"
            color={theme.primary}
            style={{ marginTop: 20 }}
          />
        ) : (
          cows.map((cow) => {
            const config = STATUS_CONFIG[cow.status];
            return (
              <TouchableOpacity
                key={cow.id}
                style={styles.cowCard}
                activeOpacity={0.8}
                onPress={() => router.push(`/cow/${cow.id}` as any)}
              >
                <View
                  style={[
                    styles.cowAvatar,
                    {
                      backgroundColor:
                        colorScheme === "dark" ? "#424242" : "#1A262E",
                    },
                  ]}
                >
                  <MaterialCommunityIcons name="cow" size={32} color="#FFF" />
                </View>

                <View style={styles.cowInfo}>
                  <View style={styles.cowHeaderRow}>
                    <Text style={styles.cowName}>{cow.name}</Text>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: config.bg },
                      ]}
                    >
                      <View
                        style={[
                          styles.statusDot,
                          { backgroundColor: config.dot },
                        ]}
                      />
                      <Text style={[styles.statusText, { color: config.text }]}>
                        {cow.status}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.cowId}>ID: {cow.id}</Text>

                  <View style={styles.updateRow}>
                    <Feather
                      name="clock"
                      size={12}
                      color={theme.textSecondary}
                    />
                    <Text style={styles.updateText}>
                      Update: {getTimeAgo(cow.updatedAt)}
                    </Text>
                  </View>
                </View>

                <Feather
                  name="chevron-right"
                  size={20}
                  color={theme.textSecondary}
                />
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const getStyles = (theme: any, colorScheme: string) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colorScheme === "dark" ? theme.background : "#FAFCFB",
    },
    scrollContent: {
      paddingHorizontal: 24,
      paddingTop: 16,
      paddingBottom: 40,
    },
    greetingSection: {
      marginBottom: 24,
    },
    greetingSub: {
      fontFamily: "Manrope-Medium",
      fontSize: 16,
      color: theme.textSecondary,
      marginBottom: 4,
    },
    pageTitle: {
      fontFamily: "Manrope-ExtraBold",
      fontSize: 28,
      color: colorScheme === "dark" ? theme.primary : "#0B5345",
      letterSpacing: -0.5,
    },
    totalCard: {
      backgroundColor: theme.card,
      borderRadius: 32,
      padding: 24,
      marginBottom: 16,
      overflow: "hidden",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: colorScheme === "dark" ? 0.3 : 0.05,
      shadowRadius: 12,
      elevation: 2,
    },
    watermarkContainer: {
      position: "absolute",
      right: -20,
      bottom: -10,
      opacity: colorScheme === "dark" ? 0.4 : 0.8,
    },
    totalCardLabel: {
      fontFamily: "Manrope-Bold",
      fontSize: 13,
      color: theme.textSecondary,
      letterSpacing: 1.5,
      marginBottom: 12,
    },
    totalCardValueRow: {
      flexDirection: "row",
      alignItems: "baseline",
    },
    totalCardValue: {
      fontFamily: "Manrope-ExtraBold",
      fontSize: 48,
      color: theme.text,
      marginRight: 8,
    },
    totalCardUnit: {
      fontFamily: "Manrope-Medium",
      fontSize: 16,
      color: theme.textSecondary,
    },
    statsRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 32,
    },
    statCardLeft: {
      flex: 1,
      backgroundColor: theme.card,
      borderRadius: 24,
      padding: 20,
      marginRight: 8,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: colorScheme === "dark" ? 0.2 : 0.04,
      shadowRadius: 8,
      elevation: 2,
    },
    statCardRight: {
      flex: 1,
      backgroundColor: colorScheme === "dark" ? "#3b1a20" : "#FFEBEE",
      borderRadius: 24,
      padding: 20,
      marginLeft: 8,
    },
    statIconBoxGreen: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colorScheme === "dark" ? "#1B5E20" : "#E8F5E9",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 16,
    },
    statIconBoxRed: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: "#883445",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 16,
    },
    statLabel: {
      fontFamily: "Manrope-Bold",
      fontSize: 11,
      color: theme.textSecondary,
      letterSpacing: 1,
      marginBottom: 8,
    },
    statLabelRed: {
      fontFamily: "Manrope-Bold",
      fontSize: 11,
      color: colorScheme === "dark" ? "#FFCDD2" : "#883445",
      letterSpacing: 1,
      marginBottom: 8,
    },
    statValueRow: {
      flexDirection: "row",
      alignItems: "baseline",
    },
    statValue: {
      fontFamily: "Manrope-ExtraBold",
      fontSize: 28,
      color: theme.text,
      marginRight: 6,
    },
    statValueRed: {
      fontFamily: "Manrope-ExtraBold",
      fontSize: 28,
      color: colorScheme === "dark" ? "#FFF" : "#1A262E",
      marginRight: 6,
    },
    statUnit: {
      fontFamily: "Manrope-Medium",
      fontSize: 12,
      color: theme.textSecondary,
    },
    statUnitRed: {
      fontFamily: "Manrope-Medium",
      fontSize: 12,
      color: colorScheme === "dark" ? "#FFCDD2" : "#B71C1C",
    },
    listHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 16,
    },
    listTitle: {
      fontFamily: "Manrope-Bold",
      fontSize: 18,
      color: theme.text,
    },
    listShowAll: {
      fontFamily: "Manrope-Bold",
      fontSize: 13,
    },
    cowCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.card,
      borderRadius: 24,
      padding: 16,
      marginBottom: 12,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: colorScheme === "dark" ? 0.2 : 0.03,
      shadowRadius: 6,
      elevation: 2,
    },
    cowAvatar: {
      width: 60,
      height: 60,
      borderRadius: 16,
      marginRight: 16,
      alignItems: "center",
      justifyContent: "center",
    },
    cowInfo: {
      flex: 1,
    },
    cowHeaderRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 4,
    },
    cowName: {
      fontFamily: "Manrope-ExtraBold",
      fontSize: 16,
      color: theme.text,
      marginRight: 8,
    },
    statusBadge: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 12,
    },
    statusDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      marginRight: 4,
    },
    statusText: {
      fontFamily: "Manrope-Bold",
      fontSize: 9,
      letterSpacing: 0.5,
    },
    cowId: {
      fontFamily: "Manrope-Medium",
      fontSize: 12,
      color: theme.textSecondary,
      marginBottom: 8,
    },
    updateRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    updateText: {
      fontFamily: "Manrope-Medium",
      fontSize: 11,
      color: theme.textSecondary,
      marginLeft: 4,
    },
  });
