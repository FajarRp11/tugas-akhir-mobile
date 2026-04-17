import { Colors } from "@/constants/theme";
import { getSensorData } from "@/services/api";
import { SensorReading } from "@/types";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";

// --- Types & Helpers ---

type CowStatus = "normal" | "warning" | "kritis";

interface CowLocation {
  id: string; // deviceId
  cowName: string;
  latitude: number;
  longitude: number;
  heartRate: number | null;
  temperature: number | null;
  spo2: number | null;
  status: CowStatus;
  lastReading: SensorReading;
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
    return "kritis";
  if (
    (temperature && (temperature > 39.5 || temperature < 38.0)) ||
    (heartRate && (heartRate > 80 || heartRate < 55)) ||
    (spo2 && spo2 < 95)
  )
    return "warning";
  return "normal";
}

const STATUS_COLOR: Record<CowStatus, string> = {
  normal: "#4CAF50",
  warning: "#F9A825",
  kritis: "#D32F2F",
};

const STATUS_LABEL: Record<CowStatus, string> = {
  normal: "SEHAT",
  warning: "PERHATIAN",
  kritis: "KRITIS",
};

// Default region: Indonesia (center)
const DEFAULT_REGION = {
  latitude: -0.7893,
  longitude: 113.9213,
  latitudeDelta: 20,
  longitudeDelta: 20,
};

// --- Main Component ---

export default function MapScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];
  const styles = getStyles(theme, colorScheme);

  const mapRef = useRef<MapView>(null);
  const cardAnim = useRef(new Animated.Value(0)).current;

  const [cows, setCows] = useState<CowLocation[]>([]);
  const [filtered, setFiltered] = useState<CowLocation[]>([]);
  const [selected, setSelected] = useState<CowLocation | null>(null);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // --- Data Fetching ---
  const fetchLocations = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await getSensorData();
      const readings: SensorReading[] = res.data.data;

      // Keep only readings with valid coordinates, deduplicate by deviceId (latest first)
      const latestByDevice = new Map<string, SensorReading>();
      for (const r of readings) {
        const lat = parseFloat(String(r.latitude));
        const lng = parseFloat(String(r.longitude));
        if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
          if (!latestByDevice.has(r.deviceId)) {
            latestByDevice.set(r.deviceId, r);
          }
        }
      }

      const locations: CowLocation[] = Array.from(latestByDevice.values()).map(
        (r) => ({
          id: r.deviceId,
          cowName: r.device?.cow?.name ?? r.deviceId,
          latitude: parseFloat(String(r.latitude)),
          longitude: parseFloat(String(r.longitude)),
          heartRate: r.heartRate != null ? Number(r.heartRate) : null,
          temperature: r.temperature != null ? Number(r.temperature) : null,
          spo2: r.spo2 != null ? Number(r.spo2) : null,
          status: getStatus(r),
          lastReading: r,
        }),
      );

      setCows(locations);
      setFiltered(locations);

      // Fit map to markers if available
      if (locations.length > 0 && mapRef.current) {
        mapRef.current.fitToCoordinates(
          locations.map((c) => ({
            latitude: c.latitude,
            longitude: c.longitude,
          })),
          {
            edgePadding: { top: 120, right: 60, bottom: 280, left: 60 },
            animated: true,
          },
        );
      }
    } catch {
      /* silent */
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  // --- Search ---
  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      q
        ? cows.filter(
            (c) =>
              c.cowName.toLowerCase().includes(q) ||
              c.id.toLowerCase().includes(q),
          )
        : cows,
    );
  }, [search, cows]);

  // --- Bottom Card Animation ---
  const showCard = (cow: CowLocation) => {
    setSelected(cow);
    mapRef.current?.animateToRegion(
      {
        latitude: cow.latitude - 0.001,
        longitude: cow.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      },
      400,
    );
    Animated.spring(cardAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 70,
      friction: 10,
    }).start();
  };

  const hideCard = () => {
    Animated.timing(cardAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setSelected(null));
  };

  const cardTranslateY = cardAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [300, 0],
  });

  // --- Zoom Controls ---
  const zoomIn = () => {
    mapRef.current?.getCamera().then((camera) => {
      mapRef.current?.animateCamera(
        { zoom: (camera.zoom ?? 14) + 1 },
        { duration: 300 },
      );
    });
  };

  const zoomOut = () => {
    mapRef.current?.getCamera().then((camera) => {
      mapRef.current?.animateCamera(
        { zoom: (camera.zoom ?? 14) - 1 },
        { duration: 300 },
      );
    });
  };

  return (
    <View style={styles.container}>
      {/* Full-screen Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        mapType="hybrid"
        initialRegion={DEFAULT_REGION}
        showsUserLocation
        showsMyLocationButton={false}
        onPress={() => selected && hideCard()}
      >
        {filtered.map((cow) => (
          <Marker
            key={cow.id}
            coordinate={{ latitude: cow.latitude, longitude: cow.longitude }}
            onPress={() => showCard(cow)}
            title={cow.cowName}
          >
            <View
              style={[
                styles.markerIconCircle,
                { backgroundColor: STATUS_COLOR[cow.status] },
              ]}
            >
              <MaterialCommunityIcons name="paw" size={16} color="#FFF" />
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Search Bar Overlay */}
      <View style={styles.searchWrapper}>
        <View style={styles.searchBar}>
          <Feather
            name="search"
            size={16}
            color={theme.textSecondary}
            style={{ marginRight: 8 }}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari nama atau ID sapi..."
            placeholderTextColor={theme.textSecondary}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Feather name="x" size={16} color={theme.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.filterBtn}>
          <Feather name="sliders" size={18} color={theme.primary} />
        </TouchableOpacity>
      </View>

      {/* Loading spinner */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      )}

      {/* Zoom Controls */}
      <View style={styles.zoomControls}>
        <TouchableOpacity style={styles.zoomBtn} onPress={zoomIn}>
          <Feather name="plus" size={20} color="#333" />
        </TouchableOpacity>
        <View style={styles.zoomDivider} />
        <TouchableOpacity style={styles.zoomBtn} onPress={zoomOut}>
          <Feather name="minus" size={20} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Bottom Detail Card */}
      {selected && (
        <Animated.View
          style={[
            styles.detailCard,
            { transform: [{ translateY: cardTranslateY }] },
          ]}
        >
          {/* Close Button */}
          <TouchableOpacity style={styles.closeBtn} onPress={hideCard}>
            <Feather name="x" size={18} color="#555" />
          </TouchableOpacity>

          {/* Cow Header */}
          <View style={styles.detailHeader}>
            <View style={styles.cowAvatarBox}>
              <MaterialCommunityIcons name="cow" size={32} color="#FFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.detailCowName}>{selected.cowName}</Text>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: STATUS_COLOR[selected.status] + "22" },
                ]}
              >
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: STATUS_COLOR[selected.status] },
                  ]}
                />
                <Text
                  style={[
                    styles.statusText,
                    { color: STATUS_COLOR[selected.status] },
                  ]}
                >
                  {STATUS_LABEL[selected.status]}
                </Text>
              </View>
            </View>
          </View>

          {/* Vital Stats */}
          <View style={styles.vitalRow}>
            <View style={styles.vitalItem}>
              <View style={[styles.vitalIcon, { backgroundColor: "#FFEBEE" }]}>
                <Feather name="heart" size={16} color="#D32F2F" />
              </View>
              <View>
                <Text style={styles.vitalLabel}>DETAK JANTUNG</Text>
                <Text style={styles.vitalValue}>
                  {selected.heartRate ?? "—"}
                  <Text style={styles.vitalUnit}> bpm</Text>
                </Text>
              </View>
            </View>

            <View style={styles.vitalDivider} />

            <View style={styles.vitalItem}>
              <View style={[styles.vitalIcon, { backgroundColor: "#E8F5E9" }]}>
                <MaterialCommunityIcons
                  name="thermometer"
                  size={16}
                  color="#2E7D32"
                />
              </View>
              <View>
                <Text style={styles.vitalLabel}>SUHU TUBUH</Text>
                <Text style={styles.vitalValue}>
                  {selected.temperature != null
                    ? selected.temperature.toFixed(1)
                    : "—"}
                  <Text style={styles.vitalUnit}> °C</Text>
                </Text>
              </View>
            </View>
          </View>

          {/* CTA */}
          <TouchableOpacity style={styles.detailBtn} activeOpacity={0.85}>
            <Feather
              name="eye"
              size={16}
              color="#FFF"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.detailBtnText}>Lihat Detail Lengkap</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
}

// --- Styles ---
const getStyles = (theme: any, colorScheme: string) =>
  StyleSheet.create({
    container: { flex: 1 },
    map: { ...StyleSheet.absoluteFillObject },

    // Search
    searchWrapper: {
      position: "absolute",
      top: 16,
      left: 16,
      right: 16,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    searchBar: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#FFF",
      borderRadius: 14,
      paddingHorizontal: 14,
      paddingVertical: Platform.OS === "ios" ? 12 : 9,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
      elevation: 4,
    },
    searchInput: {
      flex: 1,
      fontFamily: "Manrope-Medium",
      fontSize: 14,
      color: "#1A262E",
    },
    filterBtn: {
      backgroundColor: "#FFF",
      width: 46,
      height: 46,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
      elevation: 4,
    },

    // Zoom controls
    zoomControls: {
      position: "absolute",
      right: 16,
      top: "45%",
      backgroundColor: "#FFF",
      borderRadius: 14,
      overflow: "hidden",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
      elevation: 4,
    },
    zoomBtn: {
      width: 44,
      height: 44,
      alignItems: "center",
      justifyContent: "center",
    },
    zoomDivider: {
      height: 1,
      backgroundColor: "#E0E0E0",
      marginHorizontal: 8,
    },

    // Marker
    markerIconCircle: {
      width: 36,
      height: 36,
      borderRadius: 18,
      borderWidth: 3,
      borderColor: "#FFF",
      alignItems: "center",
      justifyContent: "center",
      // Nonaktifkan shadow untuk custom marker di Android karena sering membuat clip
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 4,
        },
      }),
    },
    markerTriangle: {
      width: 0,
      height: 0,
      backgroundColor: "transparent",
      borderStyle: "solid",
      borderLeftWidth: 5,
      borderRightWidth: 5,
      borderBottomWidth: 0,
      borderTopWidth: 6,
      borderLeftColor: "transparent",
      borderRightColor: "transparent",
      marginTop: -2,
      marginBottom: 3,
    },
    markerLabelContainer: {
      backgroundColor: "#FFF",
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: "#E0E0E0",
    },
    markerLabel: {
      fontFamily: "Manrope-Bold",
      fontSize: 11,
    },

    // Loading
    loadingOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(0,0,0,0.25)",
      alignItems: "center",
      justifyContent: "center",
    },

    // Detail Card
    detailCard: {
      position: "absolute",
      bottom: Platform.OS === "ios" ? 100 : 80,
      left: 16,
      right: 16,
      backgroundColor: "#FFF",
      borderRadius: 28,
      padding: 20,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.1,
      shadowRadius: 16,
      elevation: 8,
    },
    closeBtn: {
      position: "absolute",
      top: 16,
      right: 16,
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: "#F3F4F6",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 99,
      elevation: 5,
    },
    detailHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 16,
      gap: 12,
    },
    cowAvatarBox: {
      width: 56,
      height: 56,
      borderRadius: 16,
      backgroundColor: "#1A262E",
      alignItems: "center",
      justifyContent: "center",
    },
    detailCowName: {
      fontFamily: "Manrope-ExtraBold",
      fontSize: 16,
      color: "#1A262E",
      marginBottom: 6,
    },
    statusBadge: {
      flexDirection: "row",
      alignItems: "center",
      alignSelf: "flex-start",
      paddingHorizontal: 10,
      paddingVertical: 3,
      borderRadius: 100,
      gap: 5,
    },
    statusDot: {
      width: 7,
      height: 7,
      borderRadius: 4,
    },
    statusText: {
      fontFamily: "Manrope-Bold",
      fontSize: 11,
      letterSpacing: 0.5,
    },
    vitalRow: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#F5F7FA",
      borderRadius: 18,
      padding: 16,
      marginBottom: 16,
    },
    vitalItem: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    vitalIcon: {
      width: 36,
      height: 36,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    vitalLabel: {
      fontFamily: "Manrope-Bold",
      fontSize: 9,
      color: "#9E9E9E",
      letterSpacing: 0.4,
      marginBottom: 2,
    },
    vitalValue: {
      fontFamily: "Manrope-ExtraBold",
      fontSize: 18,
      color: "#1A262E",
    },
    vitalUnit: {
      fontFamily: "Manrope-Medium",
      fontSize: 11,
      color: "#9E9E9E",
    },
    vitalDivider: {
      width: 1,
      height: 36,
      backgroundColor: "#E0E0E0",
      marginHorizontal: 12,
    },
    detailBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#2E7D32",
      borderRadius: 14,
      paddingVertical: 14,
    },
    detailBtnText: {
      fontFamily: "Manrope-Bold",
      fontSize: 15,
      color: "#FFF",
    },
  });
