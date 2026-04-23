import { Colors } from "@/constants/theme";
import {
  createDevice,
  deleteDevice,
  getCows,
  getDevices,
  updateDevice,
} from "@/services/api";
import { Cow, Device } from "@/types";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { router, Stack } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  useColorScheme,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function DeviceManagementScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];
  const styles = getStyles(theme, colorScheme);
  const insets = useSafeAreaInsets();

  const [devices, setDevices] = useState<Device[]>([]);
  const [cows, setCows] = useState<Cow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form states
  const [modalVisible, setModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const [formDeviceId, setFormDeviceId] = useState("");
  const [formCowId, setFormCowId] = useState<number | null>(null);
  const [formIsActive, setFormIsActive] = useState(true);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [devRes, cowRes] = await Promise.all([getDevices(), getCows()]);
      setDevices(devRes.data.data);
      setCows(cowRes.data.data);
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAdd = () => {
    setEditingDevice(null);
    setFormDeviceId("");
    setFormCowId(null);
    setFormIsActive(true);
    setModalVisible(true);
  };

  const handleOpenEdit = (device: Device) => {
    setEditingDevice(device);
    setFormDeviceId(device.deviceId);
    setFormCowId(device.cowId);
    setFormIsActive(Boolean(device.isActive));
    setModalVisible(true);
  };

  const handleDelete = (id: number) => {
    Alert.alert(
      "Hapus Perangkat",
      "Apakah Anda yakin ingin menghapus perangkat ini?",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: async () => {
            try {
              setIsLoading(true);
              await deleteDevice(id);
              await fetchData();
            } catch (e) {
              Alert.alert("Gagal", "Gagal menghapus perangkat.");
              setIsLoading(false);
            }
          },
        },
      ],
    );
  };

  const handleSave = async () => {
    if (!formDeviceId.trim()) {
      Alert.alert("Error", "Device ID tidak boleh kosong");
      return;
    }

    try {
      setIsSubmitting(true);
      if (editingDevice) {
        await updateDevice(editingDevice.id, {
          cowId: formCowId ?? undefined,
          isActive: formIsActive,
        });
      } else {
        await createDevice({
          deviceId: formDeviceId,
          cowId: formCowId ?? undefined,
        });
      }
      setModalVisible(false);
      await fetchData();
    } catch (e: any) {
      Alert.alert(
        "Error",
        e?.response?.data?.message || "Gagal menyimpan data perangkat",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeCount = devices.filter((d) => d.isActive).length;
  const offlineCount = devices.length - activeCount;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.headerBar}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <Feather name="arrow-left" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Kelola Perangkat</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              colors={[theme.primary]}
              onRefresh={fetchData}
            />
          }
        >
          {/* Intro Section */}
          <View style={styles.introSection}>
            <View style={styles.breadcrumbRow}>
              <Text style={styles.breadcrumbText}>Manajemen </Text>
              <Feather
                name="chevron-right"
                size={12}
                color={theme.textSecondary}
              />
              <Text style={styles.breadcrumbActiveText}> Daftar Perangkat</Text>
            </View>
            <Text style={styles.pageTitle}>Kelola Perangkat</Text>
            <Text style={styles.pageDescription}>
              Pantau dan kelola semua sensor IoT yang terpasang pada ternak Anda
              untuk memastikan data kesehatan yang akurat secara real-time.
            </Text>
            <TouchableOpacity
              style={styles.primaryAddBtn}
              activeOpacity={0.8}
              onPress={handleOpenAdd}
            >
              <Feather
                name="plus"
                size={18}
                color="#FFF"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.primaryAddBtnText}>
                Tambah Perangkat Baru
              </Text>
            </TouchableOpacity>
          </View>

          {/* Stats Section */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <View style={styles.statInfo}>
                <Text style={styles.statLabel}>TOTAL PERANGKAT</Text>
                <Text style={styles.statValue}>{devices.length}</Text>
              </View>
              <View
                style={[styles.statIconBox, { backgroundColor: "#B2FF59" }]}
              >
                <MaterialCommunityIcons
                  name="access-point-network"
                  size={24}
                  color="#1B5E20"
                />
              </View>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statInfo}>
                <Text style={styles.statLabel}>AKTIF</Text>
                <Text style={[styles.statValue, { color: "#1B5E20" }]}>
                  {activeCount}
                </Text>
              </View>
              <View
                style={[styles.statIconBox, { backgroundColor: "#A5D6A7" }]}
              >
                <Feather name="check-circle" size={24} color="#1B5E20" />
              </View>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statInfo}>
                <Text style={styles.statLabel}>OFFLINE</Text>
                <Text style={[styles.statValue, { color: "#D32F2F" }]}>
                  {offlineCount}
                </Text>
              </View>
              <View
                style={[styles.statIconBox, { backgroundColor: "#FFCDD2" }]}
              >
                <Feather name="alert-circle" size={24} color="#B71C1C" />
              </View>
            </View>
          </View>

          {/* Device List Header */}
          <View style={styles.listHeaderRow}>
            <Text style={styles.listTitle}>Daftar Perangkat IoT</Text>
            <View style={styles.listHeaderActions}>
              <TouchableOpacity style={styles.iconBtn}>
                <Feather name="filter" size={18} color={theme.text} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconBtn}>
                <Feather name="search" size={18} color={theme.text} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Device List */}
          {isLoading && devices.length === 0 ? (
            <ActivityIndicator
              size="large"
              color={theme.primary}
              style={{ marginTop: 20 }}
            />
          ) : devices.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons
                name="access-point-off"
                size={64}
                color={theme.textSecondary}
                style={{ opacity: 0.5 }}
              />
              <Text style={styles.emptyText}>
                Belum ada perangkat yang terdaftar
              </Text>
            </View>
          ) : (
            devices.map((device) => {
              const connectedCow =
                cows.find((c) => c.id === device.cowId) ?? device.cow;
              return (
                <View key={device.id} style={styles.deviceCardSimple}>
                  <View style={styles.deviceCardHeader}>
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <Feather
                        name="cpu"
                        size={20}
                        color={theme.text}
                        style={{ marginRight: 8 }}
                      />
                      <Text style={styles.deviceSnSimple}>
                        {device.deviceId}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor: device.isActive
                            ? "#E8F5E9"
                            : "#FFEBEE",
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.statusDot,
                          {
                            backgroundColor: device.isActive
                              ? "#4CAF50"
                              : "#F44336",
                          },
                        ]}
                      />
                      <Text
                        style={[
                          styles.statusText,
                          { color: device.isActive ? "#2E7D32" : "#C62828" },
                        ]}
                      >
                        {device.isActive ? "Aktif" : "Offline"}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.deviceCardBody}>
                    <MaterialCommunityIcons
                      name="cow"
                      size={16}
                      color={theme.textSecondary}
                    />
                    <Text style={styles.cowConnText}>
                      {" "}
                      {connectedCow ? connectedCow.name : "Belum dipasangkan"}
                    </Text>
                  </View>

                  <View style={styles.deviceCardActions}>
                    <TouchableOpacity
                      style={styles.actionBtnSmallGreen}
                      onPress={() => {
                        if (connectedCow?.id) {
                          router.push(`/cow/${device.deviceId}` as any);
                        } else {
                          Alert.alert(
                            "Info",
                            "Perangkat belum terhubung ke sapi.",
                          );
                        }
                      }}
                    >
                      <Text style={styles.actionBtnTextSmallGreen}>Detail</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionBtnSmallOutline}
                      onPress={() => handleOpenEdit(device)}
                    >
                      <Feather
                        name="settings"
                        size={14}
                        color={theme.textSecondary}
                      />
                      <Text style={styles.actionBtnTextSmallOutline}>Edit</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>

        {/* Modal Form */}
        <Modal visible={modalVisible} transparent animationType="slide">
          <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
            <View style={styles.modalOverlay} />
          </TouchableWithoutFeedback>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={styles.modalContainer}
          >
            <View
              style={[styles.modalContent, { backgroundColor: theme.card }]}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {editingDevice ? "Edit Perangkat" : "Tambah Perangkat"}
                </Text>
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  style={styles.closeBtn}
                >
                  <Feather name="x" size={20} color={theme.textSecondary} />
                </TouchableOpacity>
              </View>

              <Text style={styles.inputLabel}>Device ID (SN)</Text>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    color: theme.text,
                    borderColor:
                      colorScheme === "dark" ? theme.border : "#E0E0E0",
                  },
                ]}
                placeholder="cth. IOT-XXXX"
                placeholderTextColor={theme.textSecondary}
                value={formDeviceId}
                onChangeText={setFormDeviceId}
                autoCapitalize="characters"
                editable={!editingDevice} // biasanya device ID tidak boleh diganti setelah dibuat
              />
              <View style={styles.warningBox}>
                <Feather
                  name="info"
                  size={14}
                  color="#D84315"
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.warningText}>
                  Pastikan deviceId sesuai dengan yang tertulis di perangkat
                  keras (hardware).
                </Text>
              </View>

              <Text style={styles.inputLabel}>Pasangkan Sapi</Text>
              <View
                style={[
                  styles.pickerContainer,
                  {
                    borderColor:
                      colorScheme === "dark" ? theme.border : "#E0E0E0",
                  },
                ]}
              >
                <Picker
                  selectedValue={formCowId}
                  onValueChange={(itemValue) => setFormCowId(itemValue)}
                  style={{ color: theme.text }}
                  dropdownIconColor={theme.text}
                >
                  <Picker.Item
                    label="Tidak ada (Lepas Perangkat)"
                    value={null}
                  />
                  {cows.map((cow) => (
                    <Picker.Item key={cow.id} label={cow.name} value={cow.id} />
                  ))}
                </Picker>
              </View>

              {editingDevice && (
                <View style={styles.switchRow}>
                  <Text style={styles.inputLabel}>Status Aktif</Text>
                  <Switch
                    value={formIsActive}
                    onValueChange={setFormIsActive}
                    trackColor={{ false: "#767577", true: "#81b0ff" }}
                    thumbColor={formIsActive ? "#1B5E20" : "#f4f3f4"}
                  />
                </View>
              )}

              <TouchableOpacity
                style={[styles.saveBtn, isSubmitting && { opacity: 0.7 }]}
                disabled={isSubmitting}
                activeOpacity={0.8}
                onPress={handleSave}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <Text style={styles.saveBtnText}>Simpan</Text>
                )}
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </View>
    </>
  );
}

const getStyles = (theme: any, colorScheme: string) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colorScheme === "dark" ? theme.background : "#FAFBFC",
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
      paddingTop: 16,
      paddingBottom: 40,
    },
    introSection: {
      marginBottom: 24,
    },
    breadcrumbRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 6,
    },
    breadcrumbText: {
      fontFamily: "Manrope-Medium",
      fontSize: 12,
      color: theme.textSecondary,
    },
    breadcrumbActiveText: {
      fontFamily: "Manrope-Bold",
      fontSize: 12,
      color: "#00897B",
    },
    pageTitle: {
      fontFamily: "Manrope-ExtraBold",
      fontSize: 24,
      color: theme.text,
      marginBottom: 8,
    },
    pageDescription: {
      fontFamily: "Manrope-Medium",
      fontSize: 13,
      color: theme.textSecondary,
      lineHeight: 20,
      marginBottom: 20,
    },
    primaryAddBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#1B5E20",
      paddingVertical: 14,
      borderRadius: 100,
      shadowColor: "#1B5E20",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    primaryAddBtnText: {
      fontFamily: "Manrope-Bold",
      fontSize: 14,
      color: "#FFF",
    },
    statsContainer: {
      marginBottom: 32,
    },
    statCard: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: theme.card,
      borderRadius: 24,
      padding: 20,
      marginBottom: 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: colorScheme === "dark" ? 0.2 : 0.04,
      shadowRadius: 8,
      elevation: 2,
    },
    statInfo: {
      flex: 1,
    },
    statLabel: {
      fontFamily: "Manrope-Bold",
      fontSize: 11,
      color: theme.textSecondary,
      letterSpacing: 1,
      marginBottom: 4,
    },
    statValue: {
      fontFamily: "Manrope-ExtraBold",
      fontSize: 32,
      color: theme.text,
    },
    statIconBox: {
      width: 56,
      height: 56,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
    },
    listHeaderRow: {
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
    listHeaderActions: {
      flexDirection: "row",
    },
    iconBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.card,
      alignItems: "center",
      justifyContent: "center",
      marginLeft: 8,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 1,
    },
    deviceCardSimple: {
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: colorScheme === "dark" ? 0.2 : 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    deviceCardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
    },
    deviceSnSimple: {
      fontFamily: "Manrope-Bold",
      fontSize: 14,
      color: theme.text,
    },
    statusBadge: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 8,
      paddingVertical: 4,
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
      fontSize: 10,
    },
    deviceCardBody: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 16,
    },
    cowConnText: {
      fontFamily: "Manrope-Medium",
      fontSize: 13,
      color: theme.textSecondary,
    },
    deviceCardActions: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-start",
    },
    actionBtnSmallGreen: {
      paddingVertical: 6,
      paddingHorizontal: 16,
      backgroundColor: "#1B5E20",
      borderRadius: 8,
      marginRight: 8,
    },
    actionBtnTextSmallGreen: {
      fontFamily: "Manrope-Bold",
      fontSize: 12,
      color: "#FFF",
    },
    actionBtnSmallOutline: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderWidth: 1,
      borderColor: colorScheme === "dark" ? theme.border : "#E0E0E0",
      borderRadius: 8,
    },
    actionBtnTextSmallOutline: {
      fontFamily: "Manrope-Medium",
      fontSize: 12,
      marginLeft: 4,
      color: theme.textSecondary,
    },
    emptyContainer: {
      alignItems: "center",
      justifyContent: "center",
      marginTop: 40,
      paddingBottom: 40,
    },
    emptyText: {
      fontFamily: "Manrope-Medium",
      fontSize: 14,
      color: theme.textSecondary,
      marginTop: 16,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
    },
    modalContainer: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
    },
    modalContent: {
      borderTopLeftRadius: 32,
      borderTopRightRadius: 32,
      padding: 24,
      paddingBottom: Platform.OS === "ios" ? 40 : 24,
    },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 24,
    },
    modalTitle: {
      fontFamily: "Manrope-ExtraBold",
      fontSize: 20,
      color: theme.text,
    },
    closeBtn: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colorScheme === "dark" ? theme.border : "#F5F5F5",
      alignItems: "center",
      justifyContent: "center",
    },
    inputLabel: {
      fontFamily: "Manrope-Bold",
      fontSize: 13,
      color: theme.textSecondary,
      marginBottom: 8,
      marginTop: 16,
    },
    textInput: {
      fontFamily: "Manrope-Medium",
      fontSize: 15,
      borderWidth: 1,
      borderRadius: 16,
      paddingHorizontal: 16,
      paddingVertical: 14,
      marginTop: 4,
    },
    warningBox: {
      flexDirection: "row",
      backgroundColor: "#FBE9E7",
      padding: 12,
      borderRadius: 12,
      marginTop: 12,
      alignItems: "flex-start",
    },
    warningText: {
      flex: 1,
      fontFamily: "Manrope-Medium",
      fontSize: 11,
      color: "#D84315",
      lineHeight: 16,
    },
    pickerContainer: {
      borderWidth: 1,
      borderRadius: 16,
      marginTop: 8,
      marginBottom: 16,
      overflow: "hidden", // ensures border radius affects picker
    },
    switchRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginVertical: 16,
      paddingVertical: 8,
    },
    saveBtn: {
      backgroundColor: "#4CAF50",
      paddingVertical: 16,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 24,
    },
    saveBtnText: {
      fontFamily: "Manrope-Bold",
      fontSize: 16,
      color: "#FFF",
    },
  });
