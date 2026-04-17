import { Colors } from "@/constants/theme";
import { useDashboard } from "@/hooks/use-dashboard";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AllCowsScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];
  const styles = getStyles(theme, colorScheme);

  const { cowList, isLoading, refresh } = useDashboard();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCows = cowList.filter(
    (cow) =>
      cow.cowName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (cow.deviceId &&
        cow.deviceId.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getRelativeTime = (date: Date | null) => {
    if (!date) return "Belum ada data";
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Baru saja";
    if (diffMins < 60) return `${diffMins} menit yang lalu`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} jam yang lalu`;
    return `${Math.floor(diffHours / 24)} hari yang lalu`;
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Feather name="arrow-left" size={24} color="#1A262E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Semua Daftar Sapi</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Feather
            name="search"
            size={18}
            color={theme.textSecondary}
            style={{ marginRight: 8 }}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari ID sapi atau nama..."
            placeholderTextColor={theme.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Feather name="x-circle" size={18} color={theme.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* List */}
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
        {isLoading ? (
          <ActivityIndicator color={theme.primary} style={{ marginTop: 40 }} />
        ) : filteredCows.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Tidak ada sapi ditemukan.</Text>
          </View>
        ) : (
          <View style={styles.cowList}>
            {filteredCows.map((cow) => {
              let badgeColor = "#4CAF50";
              let badgeBg = "#E8F5E9";
              if (cow.status === "peringatan") {
                badgeColor = "#F57C00";
                badgeBg = "#FFF3E0";
              } else if (cow.status === "kritis") {
                badgeColor = "#D32F2F";
                badgeBg = "#FFEBEE";
              }

              return (
                <TouchableOpacity
                  key={cow.id}
                  style={styles.cowItem}
                  activeOpacity={0.7}
                >
                  <View style={styles.cowAvatar}>
                    <MaterialCommunityIcons name="cow" size={32} color="#FFF" />
                  </View>
                  <View style={styles.cowInfo}>
                    <View style={styles.cowTitleRow}>
                      <Text style={styles.cowName}>{cow.cowName}</Text>
                      <View
                        style={[styles.badge, { backgroundColor: badgeBg }]}
                      >
                        <View
                          style={[
                            styles.badgeDot,
                            { backgroundColor: badgeColor },
                          ]}
                        />
                        <Text style={[styles.badgeText, { color: badgeColor }]}>
                          {cow.status.toUpperCase()}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.cowIdText}>
                      ID: {cow.deviceId || cow.id}
                    </Text>
                    <View style={styles.cowUpdateRow}>
                      <Feather
                        name="clock"
                        size={10}
                        color={theme.textSecondary}
                      />
                      <Text style={styles.cowUpdateText}>
                        Update: {getRelativeTime(cow.lastUpdate)}
                      </Text>
                    </View>
                  </View>
                  <Feather name="chevron-right" size={20} color="#CFD8DC" />
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (theme: any, colorScheme: string) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#F7F9FA",
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: "#FFF",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 5,
      elevation: 2,
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#F0F4F8",
    },
    headerTitle: {
      fontFamily: "Manrope-Bold",
      fontSize: 18,
      color: "#1A262E",
    },
    searchContainer: {
      paddingHorizontal: 20,
      paddingVertical: 16,
    },
    searchBar: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#FFF",
      borderRadius: 14,
      paddingHorizontal: 16,
      paddingVertical: Platform.OS === "ios" ? 14 : 10,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.03,
      shadowRadius: 6,
      elevation: 1,
    },
    searchInput: {
      flex: 1,
      fontFamily: "Manrope-Medium",
      fontSize: 14,
      color: "#1A262E",
    },
    scrollContent: {
      paddingHorizontal: 20,
      paddingBottom: 40,
    },
    cowList: {
      gap: 12,
    },
    cowItem: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#FFF",
      padding: 16,
      borderRadius: 20,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.03,
      shadowRadius: 6,
      elevation: 1,
    },
    cowAvatar: {
      width: 50,
      height: 50,
      borderRadius: 14,
      backgroundColor: "#1A262E",
      alignItems: "center",
      justifyContent: "center",
      marginRight: 16,
    },
    cowInfo: {
      flex: 1,
    },
    cowTitleRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 4,
      paddingRight: 8,
    },
    cowName: {
      fontFamily: "Manrope-Bold",
      fontSize: 15,
      color: "#1A262E",
    },
    badge: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 100,
      gap: 4,
    },
    badgeDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
    },
    badgeText: {
      fontFamily: "Manrope-Bold",
      fontSize: 9,
    },
    cowIdText: {
      fontFamily: "Manrope-Medium",
      fontSize: 11,
      color: "#78909C",
      marginBottom: 6,
    },
    cowUpdateRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    cowUpdateText: {
      fontFamily: "Manrope-Medium",
      fontSize: 10,
      color: "#90A4AE",
    },
    emptyContainer: {
      padding: 40,
      alignItems: "center",
    },
    emptyText: {
      fontFamily: "Manrope-Medium",
      fontSize: 14,
      color: "#78909C",
    },
  });
