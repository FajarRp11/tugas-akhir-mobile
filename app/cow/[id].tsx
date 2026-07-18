import { Colors } from "@/constants/theme";
import { SensorEvent, usePusher } from "@/hooks/use-pusher";
import { getSensorDataByDevice } from "@/services/api";
import { SensorReading } from "@/types";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
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
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type CowStatus = "NORMAL" | "PERINGATAN" | "KRITIS";

function getStatus(reading: SensorReading): CowStatus {
  const temperature =
    reading.temperature != null ? Number(reading.temperature) : null;
  const heartRate =
    reading.heartRate != null ? Number(reading.heartRate) : null;
  const spo2 = reading.spo2 != null ? Number(reading.spo2) : null;

  if (
    (temperature && temperature > 37) ||
    (heartRate && heartRate > 84) ||
    (spo2 && spo2 < 94)
  )
    return "KRITIS";
  if (
    (temperature && (temperature > 37.0 || temperature < 30.0)) ||
    (heartRate && (heartRate > 84 || heartRate < 48)) ||
    (spo2 && spo2 < 94)
  )
    return "PERINGATAN";
  return "NORMAL";
}

function getIssueText(reading: SensorReading): string | null {
  const issues: string[] = [];
  if (reading.heartRate && reading.heartRate > 80)
    issues.push("Detak jantung tinggi!");
  if (reading.temperature && reading.temperature > 37.0)
    issues.push("Suhu tubuh tinggi!");
  if (reading.spo2 && reading.spo2 < 95) issues.push("Kadar oksigen rendah!");
  return issues.length > 0 ? issues[0] : null;
}

const STATUS_CONFIG: Record<
  CowStatus,
  { bg: string; text: string; label: string }
> = {
  NORMAL: { bg: "#A5D6A7", text: "#1B5E20", label: "NORMAL" },
  PERINGATAN: { bg: "#FFCDD2", text: "#B71C1C", label: "PERINGATAN" },
  KRITIS: { bg: "#FFE0B2", text: "#E65100", label: "KRITIS" },
};

export default function CowDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];
  const styles = getStyles(theme, colorScheme);
  const insets = useSafeAreaInsets();

  const [reading, setReading] = useState<SensorReading | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDetail = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await getSensorDataByDevice(id);
      if (res.data.data && res.data.data.length > 0) {
        // Assume API returns sorted by latest, or we just take [0]
        setReading(res.data.data[0]);
      }
    } catch {
      // Handle error nicely or ignore
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  // Real-time: update data sapi saat data baru masuk via Pusher
  usePusher(
    useCallback(
      (data: SensorEvent) => {
        // Hanya proses jika data untuk device yang sedang dilihat
        if (data.deviceId !== id) return;

        const newReading: SensorReading = {
          id: Date.now(),
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
            cow: data.cowName
              ? {
                  id: 0,
                  farmerId: 0,
                  name: data.cowName,
                  createdAt: data.createdAt,
                }
              : null,
            isActive: true,
            createdAt: data.createdAt,
          },
        };

        setReading(newReading);
      },
      [id],
    ),
  );

  if (isLoading && !reading) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (!reading) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <Text style={{ color: theme.textSecondary }}>
          Data tidak ditemukan.
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginTop: 20 }}
        >
          <Text style={{ color: theme.primary, fontFamily: "Manrope-Bold" }}>
            Kembali
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const cowName = reading.device?.cow?.name ?? id;
  const status = getStatus(reading);
  const config = STATUS_CONFIG[status];
  const alertText = getIssueText(reading);

  const lat = reading.latitude ? parseFloat(String(reading.latitude)) : null;
  const lng = reading.longitude ? parseFloat(String(reading.longitude)) : null;
  const hasLocation =
    lat != null &&
    lng != null &&
    !isNaN(lat) &&
    !isNaN(lng) &&
    lat !== 0 &&
    lng !== 0;

  return (
    <>
      <View style={[styles.container]}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={fetchDetail}
              colors={[theme.primary]}
            />
          }
        >
          {status !== "NORMAL" && alertText && (
            <View style={styles.alertBox}>
              <View style={styles.alertIconBox}>
                <Feather name="alert-triangle" size={20} color="#FFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.alertTitle}>Peringatan: {alertText}</Text>
                <Text style={styles.alertDesc}>
                  Pantau aktivitas sapi secara langsung untuk keamanan.
                </Text>
              </View>
            </View>
          )}

          {/* Map Preview */}
          {hasLocation && (
            <View style={styles.mapContainer}>
              <MapView
                style={styles.map}
                provider={PROVIDER_GOOGLE}
                mapType="hybrid"
                scrollEnabled={false}
                zoomEnabled={false}
                pitchEnabled={false}
                rotateEnabled={false}
                initialCamera={{
                  center: {
                    latitude: lat!,
                    longitude: lng!,
                  },
                  pitch: 0,
                  heading: 0,
                  altitude: 500,
                  zoom: 19,
                }}
              >
                <Marker coordinate={{ latitude: lat!, longitude: lng! }}>
                  <View style={styles.mapMarkerBg}>
                    <MaterialCommunityIcons name="paw" size={14} color="#FFF" />
                  </View>
                </Marker>
              </MapView>
              <View style={styles.mapOverlayLabel}>
                <Text style={styles.mapLabelText}>LOKASI TERAKHIR</Text>
                <Text style={styles.mapCoordText}>
                  {lat!.toFixed(4)}, {lng!.toFixed(4)}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.mapLocateBtn}
                onPress={() => router.push("/(tabs)/map")}
              >
                <Feather name="crosshair" size={18} color="#1B5E20" />
              </TouchableOpacity>
            </View>
          )}

          {/* Cow Profile */}
          <View style={styles.profileRow}>
            <View
              style={[
                styles.profileImage,
                {
                  backgroundColor:
                    colorScheme === "dark" ? "#424242" : "#1A262E",
                  alignItems: "center",
                  justifyContent: "center",
                },
              ]}
            >
              <MaterialCommunityIcons name="cow" size={36} color="#FFF" />
            </View>
            <View style={styles.profileInfo}>
              <View style={styles.profileNameRow}>
                <Text style={styles.profileName}>{cowName}</Text>
                <View
                  style={[styles.statusBadge, { backgroundColor: config.bg }]}
                >
                  <Text style={[styles.statusText, { color: config.text }]}>
                    {config.label}
                  </Text>
                </View>
              </View>
              <Text style={styles.profileSub}>Betina • 24 Bulan • 450kg</Text>
            </View>
          </View>

          {/* Vital Cards */}
          {/* Temperature */}
          <View style={styles.vitalCard}>
            <View style={styles.vitalCardHeader}>
              <View
                style={[styles.vitalIconBg, { backgroundColor: "#A5D6A7" }]}
              >
                <MaterialCommunityIcons
                  name="thermometer"
                  size={24}
                  color="#1B5E20"
                />
              </View>
              <View
                style={[
                  styles.vitalStatusBadge,
                  { backgroundColor: "#E8F5E9" },
                ]}
              >
                <Text style={[styles.vitalStatusText, { color: "#1B5E20" }]}>
                  NORMAL
                </Text>
              </View>
            </View>
            <Text style={styles.vitalLabel}>DATA SUHU PERMUKAAN TUBUH</Text>
            <Text style={styles.vitalValue}>
              {reading.temperature != null
                ? Number(reading.temperature).toFixed(1)
                : "—"}
              <Text style={styles.vitalUnit}> °C</Text>
            </Text>
            <Text style={styles.vitalIndicator}>
              Indicator: Normal 30.0 - 37.0°C
            </Text>
          </View>

          {/* Heart Rate */}
          <View style={styles.vitalCard}>
            <View style={styles.vitalCardHeader}>
              <View
                style={[styles.vitalIconBg, { backgroundColor: "#FFCDD2" }]}
              >
                <MaterialCommunityIcons
                  name="heart"
                  size={24}
                  color="#B71C1C"
                />
              </View>
              {reading.heartRate &&
              (reading.heartRate > 80 || reading.heartRate < 55) ? (
                <View
                  style={[
                    styles.vitalStatusBadge,
                    { backgroundColor: "#FFEBEE" },
                  ]}
                >
                  <Text style={[styles.vitalStatusText, { color: "#B71C1C" }]}>
                    TINGGI
                  </Text>
                </View>
              ) : (
                <View
                  style={[
                    styles.vitalStatusBadge,
                    { backgroundColor: "#E8F5E9" },
                  ]}
                >
                  <Text style={[styles.vitalStatusText, { color: "#1B5E20" }]}>
                    NORMAL
                  </Text>
                </View>
              )}
            </View>
            <Text style={styles.vitalLabel}>DATA DETAK JANTUNG</Text>
            <Text style={styles.vitalValue}>
              {reading.heartRate != null ? Number(reading.heartRate) : "—"}
              <Text style={styles.vitalUnit}> BPM</Text>
            </Text>
            <Text style={styles.vitalIndicator}>
              Indicator: Normal 60 - 80 BPM
            </Text>
          </View>

          {/* SPO2 */}
          <View style={styles.vitalCard}>
            <View style={styles.vitalCardHeader}>
              <View
                style={[styles.vitalIconBg, { backgroundColor: "#FFCDD2" }]}
              >
                <MaterialCommunityIcons
                  name="weather-windy"
                  size={24}
                  color="#B71C1C"
                />
              </View>
              <View
                style={[
                  styles.vitalStatusBadge,
                  { backgroundColor: "#E8F5E9" },
                ]}
              >
                <Text style={[styles.vitalStatusText, { color: "#1B5E20" }]}>
                  OPTIMAL
                </Text>
              </View>
            </View>
            <Text style={styles.vitalLabel}>SPO2</Text>
            <Text style={styles.vitalValue}>
              {reading.spo2 != null ? Number(reading.spo2) : "—"}
              <Text style={styles.vitalUnit}> %</Text>
            </Text>
            <Text style={styles.vitalIndicator}>
              Indicator: Normal 95 - 100%
            </Text>
          </View>
        </ScrollView>
      </View>
    </>
  );
}

const getStyles = (theme: any, colorScheme: string) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colorScheme === "dark" ? theme.background : "#FAFCFB",
    },
    scrollContent: {
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 40,
    },
    alertBox: {
      backgroundColor: "#C62828",
      borderRadius: 16,
      padding: 16,
      flexDirection: "row",
      alignItems: "flex-start",
      marginBottom: 20,
      shadowColor: "#C62828",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    alertIconBox: {
      marginTop: 2,
      marginRight: 12,
    },
    alertTitle: {
      fontFamily: "Manrope-Bold",
      fontSize: 14,
      color: "#FFF",
      marginBottom: 4,
    },
    alertDesc: {
      fontFamily: "Manrope-Medium",
      fontSize: 12,
      color: "#FFCDD2",
      lineHeight: 18,
    },
    mapContainer: {
      height: 200,
      borderRadius: 24,
      overflow: "hidden",
      marginBottom: 24,
      backgroundColor: "#E0E0E0",
    },
    map: {
      ...StyleSheet.absoluteFillObject,
    },
    mapMarkerBg: {
      backgroundColor: "#1B5E20",
      padding: 6,
      borderRadius: 16,
      borderWidth: 2,
      borderColor: "#FFF",
    },
    mapOverlayLabel: {
      position: "absolute",
      bottom: 16,
      left: 16,
      backgroundColor: "rgba(255,255,255,0.95)",
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 16,
    },
    mapLabelText: {
      fontFamily: "Manrope-Bold",
      fontSize: 10,
      color: "#388E3C",
      letterSpacing: 0.5,
    },
    mapCoordText: {
      fontFamily: "Manrope-Medium",
      fontSize: 11,
      color: "#424242",
      marginTop: 2,
    },
    mapLocateBtn: {
      position: "absolute",
      top: 16,
      right: 16,
      backgroundColor: "#FFF",
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    profileRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 24,
    },
    profileImage: {
      width: 70,
      height: 70,
      borderRadius: 24,
      marginRight: 16,
      borderWidth: 2,
      borderColor: "#FFF",
    },
    profileInfo: {
      flex: 1,
    },
    profileNameRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 6,
    },
    profileName: {
      fontFamily: "Manrope-ExtraBold",
      fontSize: 20,
      color: theme.text,
      marginRight: 10,
    },
    statusBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
    },
    statusText: {
      fontFamily: "Manrope-Bold",
      fontSize: 10,
    },
    profileSub: {
      fontFamily: "Manrope-Medium",
      fontSize: 13,
      color: theme.textSecondary,
    },
    vitalCard: {
      backgroundColor: theme.card,
      borderRadius: 24,
      padding: 20,
      marginBottom: 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: colorScheme === "dark" ? 0.3 : 0.05,
      shadowRadius: 10,
      elevation: 2,
    },
    vitalCardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    vitalIconBg: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: "center",
      justifyContent: "center",
    },
    vitalStatusBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
    },
    vitalStatusText: {
      fontFamily: "Manrope-Bold",
      fontSize: 10,
    },
    vitalLabel: {
      fontFamily: "Manrope-Bold",
      fontSize: 11,
      color: theme.textSecondary,
      letterSpacing: 1,
      marginBottom: 8,
    },
    vitalValue: {
      fontFamily: "Manrope-ExtraBold",
      fontSize: 36,
      color: theme.text,
      marginBottom: 16,
    },
    vitalUnit: {
      fontFamily: "Manrope-Medium",
      fontSize: 16,
      color: theme.textSecondary,
    },
    vitalIndicator: {
      fontFamily: "Manrope-Medium",
      fontSize: 11,
      color: theme.textSecondary,
      fontStyle: "italic",
    },
  });
