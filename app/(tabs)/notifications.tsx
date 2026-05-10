import { Colors } from "@/constants/theme";
import { SensorEvent, usePusher } from "@/hooks/use-pusher";
import { getAnomalyHistory } from "@/services/api";
import { SensorReading } from "@/types";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// --- Types ---
type NotifType = "kritis" | "peringatan" | "info";

// --- Utilities ---
function getAnomalyDetails(cowName: string, reading: SensorReading) {
  if (reading.temperature && reading.temperature > 37.0) {
    return {
      title: `${cowName}: Suhu Tubuh Tinggi`,
      description: `Terdeteksi suhu tubuh mencapai ${Number(reading.temperature).toFixed(1)}°C. Segera lakukan pengecekan fisik untuk menghindari potensi stres panas atau infeksi.`,
    };
  }
  if (reading.temperature && reading.temperature < 30.0) {
    return {
      title: `${cowName}: Suhu Tubuh Rendah`,
      description: `Terdeteksi suhu tubuh turun ke ${Number(reading.temperature).toFixed(1)}°C. Pastikan sapi di tempat tertutup atau lebih hangat.`,
    };
  }
  if (reading.heartRate && reading.heartRate > 80) {
    return {
      title: `${cowName}: Detak Jantung Cepat`,
      description: `Detak jantung sapi terdeteksi di atas batas normal (${Math.floor(reading.heartRate)} bpm). Sistem akan terus menyimpan log dan memantau perkembangannya.`,
    };
  }
  if (reading.heartRate && reading.heartRate < 60) {
    return {
      title: `${cowName}: Detak Jantung Lambat`,
      description: `Detak jantung sapi melambat di angka ${Math.floor(reading.heartRate)} bpm. Segera lakukan pemeriksaan untuk mengantisipasi potensi indikasi masalah.`,
    };
  }
  if (reading.spo2 && reading.spo2 < 95) {
    return {
      title: `${cowName}: Kadar Oksigen Rendah`,
      description: `Saturasi oksigen terdeteksi di level ${Math.floor(reading.spo2)}%. Waspadai kemungkinan gangguan pernapasan.`,
    };
  }
  return {
    title: `${cowName}: Data Tidak Biasa`,
    description:
      "Sistem mendeteksi aktivitas anomali pada sensor. Harap tinjau grafik dashboard untuk perincian selengkapnya.",
  };
}

const getIconProps = (reading: SensorReading) => {
  let type: NotifType = "peringatan";
  if (
    (reading.temperature && reading.temperature > 40) ||
    (reading.heartRate && reading.heartRate > 90) ||
    (reading.spo2 && reading.spo2 < 90)
  ) {
    type = "kritis";
  }

  switch (type as NotifType) {
    case "kritis":
      return {
        type,
        icon: "thermometer",
        bg: "#FFEBEE",
        color: "#D32F2F",
      } as const;
    case "peringatan":
      return {
        type,
        icon: "alert-circle-outline",
        bg: "#FCE4EC",
        color: "#C2185B",
      } as const;
    case "info":
      return {
        type,
        icon: "heart-pulse",
        bg: "#E8F5E9",
        color: "#2E7D32",
      } as const;
  }
};

const getBadgeStyle = (type: NotifType | "default") => {
  switch (type) {
    case "kritis":
      return { bg: "#FFEBEE", text: "#D32F2F" };
    case "peringatan":
      return { bg: "#FCE4EC", text: "#C2185B" };
    case "info":
      return { bg: "#E8F5E9", text: "#2E7D32" };
    default:
      return { bg: "#F5F5F5", text: "#757575" };
  }
};

function formatTimeElapsed(dateStr: string) {
  const diffHours = Math.floor(
    (new Date().getTime() - new Date(dateStr).getTime()) / (1000 * 60 * 60),
  );

  if (diffHours < 1) {
    return "BARU SAJA";
  }
  if (diffHours >= 24) {
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} HARI\nYANG LALU`;
  }

  return `${diffHours} JAM\nYANG LALU`;
}

// --- Main Component ---
export default function NotificationsScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];
  const styles = getStyles(theme, colorScheme);
  const insets = useSafeAreaInsets();

  const [notifications, setNotifications] = useState<SensorReading[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await getAnomalyHistory();
      setNotifications(res.data.data);
    } catch {
      /* silent */
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Real-time: tambahkan notifikasi baru jika data anomali masuk
  usePusher(
    useCallback((data: SensorEvent) => {
      if (!data.isAnomaly) return;

      // Konversi SensorEvent ke SensorReading agar kompatibel dengan list
      const newReading: SensorReading = {
        id: Date.now(), // ID sementara
        deviceId: data.deviceId,
        readingId: null,
        temperature: data.temperature,
        heartRate: data.heartRate,
        spo2: data.spo2,
        latitude: data.latitude,
        longitude: data.longitude,
        rssi: data.rssi,
        createdAt: data.createdAt,
        device: {
          id: 0,
          deviceId: data.deviceId,
          cowId: null,
          cow: { id: 0, farmerId: 0, name: data.cowName, createdAt: data.createdAt },
          isActive: true,
          createdAt: data.createdAt,
        },
      };

      setNotifications((prev) => [newReading, ...prev]);
    }, []),
  );

  const renderItem = ({ item }: { item: SensorReading }) => {
    const config = getIconProps(item);
    const cowName = item.device?.cow?.name ?? item.deviceId;
    const timeText = formatTimeElapsed(item.createdAt);
    const { title, description } = getAnomalyDetails(cowName, item);

    return (
      <View style={styles.card}>
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconBox, { backgroundColor: config.bg }]}>
              <MaterialCommunityIcons
                name={config.icon as any}
                size={22}
                color={config.color}
              />
            </View>
            <View style={styles.headerTextCol}>
              <View style={styles.titleRow}>
                <Text style={styles.cardTitle}>{title}</Text>
                <Text style={styles.timeText}>{timeText}</Text>
              </View>
            </View>
          </View>

          <Text style={styles.descriptionText}>{description}</Text>

          <View style={styles.tagsContainer}>
            <View
              style={[
                styles.tagBadge,
                { backgroundColor: getBadgeStyle(config.type).bg },
              ]}
            >
              <Text
                style={[
                  styles.tagText,
                  { color: getBadgeStyle(config.type).text },
                ]}
              >
                {config.type.toUpperCase()}
              </Text>
            </View>
            <View
              style={[
                styles.tagBadge,
                { backgroundColor: getBadgeStyle("default").bg },
              ]}
            >
              <Text
                style={[
                  styles.tagText,
                  { color: getBadgeStyle("default").text },
                ]}
              >
                {item.deviceId}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerSection}>
        <View style={styles.headerLeft}>
          <Text style={styles.subtitleStr}>PUSAT INFORMASI</Text>
          <Text style={styles.titleStr}>Notifikasi</Text>
        </View>
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={fetchNotifications}
            colors={[theme.primary]}
          />
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={{ alignItems: "center", marginTop: 40 }}>
              <MaterialCommunityIcons
                name="bell-check-outline"
                size={48}
                color={theme.textSecondary}
              />
              <Text
                style={{
                  marginTop: 12,
                  color: theme.textSecondary,
                  fontFamily: "Manrope-Medium",
                }}
              >
                Tidak ada notifikasi anomali.
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const getStyles = (theme: any, colorScheme: string) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colorScheme === "dark" ? theme.background : "#F2F5F8",
    },
    headerSection: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingTop: 24,
      paddingBottom: 20,
    },
    headerLeft: {
      flex: 1,
    },
    subtitleStr: {
      fontFamily: "Manrope-Bold",
      fontSize: 10,
      color: "#F57C00",
      letterSpacing: 1,
      marginBottom: 2,
    },
    titleStr: {
      fontFamily: "Manrope-ExtraBold",
      fontSize: 26,
      color: theme.text,
    },
    markReadBtn: {
      backgroundColor: colorScheme === "dark" ? "#333" : "#E4E9EC",
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 50,
      justifyContent: "center",
      alignItems: "center",
    },
    markReadText: {
      fontFamily: "Manrope-Medium",
      fontSize: 11,
      color: colorScheme === "dark" ? "#CCC" : "#333",
      textAlign: "center",
      lineHeight: 16,
    },
    listContainer: {
      paddingHorizontal: 20,
      paddingBottom: 100,
    },
    card: {
      backgroundColor: theme.card,
      borderRadius: 24,
      marginBottom: 18,
      overflow: "hidden",
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOpacity: 0.04,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 4 },
        },
        android: { elevation: 3 },
      }),
    },
    cardContent: {
      padding: 18,
    },
    cardHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginBottom: 12,
    },
    iconBox: {
      width: 48,
      height: 48,
      borderRadius: 24,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 14,
    },
    headerTextCol: {
      flex: 1,
      justifyContent: "center",
      paddingTop: 2,
    },
    titleRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
    },
    cardTitle: {
      fontFamily: "Manrope-Bold",
      fontSize: 15,
      color: theme.text,
      flex: 1,
      marginRight: 12,
      lineHeight: 22,
    },
    timeText: {
      fontFamily: "Manrope-SemiBold",
      fontSize: 9,
      color: theme.textSecondary,
      textAlign: "right",
      lineHeight: 14,
      marginTop: 2,
    },
    descriptionText: {
      fontFamily: "Manrope-Medium",
      fontSize: 13,
      color: theme.textSecondary,
      lineHeight: 21,
      marginBottom: 16,
    },
    tagsContainer: {
      flexDirection: "row",
      gap: 10,
      flexWrap: "wrap",
    },
    tagBadge: {
      paddingHorizontal: 12,
      paddingVertical: 5,
      borderRadius: 16,
    },
    tagText: {
      fontFamily: "Manrope-ExtraBold",
      fontSize: 9,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
  });
