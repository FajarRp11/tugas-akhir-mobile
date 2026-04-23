import { Colors } from "@/constants/theme";
import { createCow, deleteCow, getCows, updateCow } from "@/services/api";
import { Cow } from "@/types";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  useColorScheme,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function CowManagementScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];
  const styles = getStyles(theme, colorScheme);
  const insets = useSafeAreaInsets();

  const [cows, setCows] = useState<Cow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [modalVisible, setModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formName, setFormName] = useState("");
  const [editingCow, setEditingCow] = useState<Cow | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchCows = async () => {
    try {
      setIsLoading(true);
      const res = await getCows();
      setCows(res.data.data);
    } catch {
      // error handle
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCows();
  }, []);

  const handleOpenAdd = () => {
    setEditingCow(null);
    setFormName("");
    setModalVisible(true);
  };

  const handleOpenEdit = (cow: Cow) => {
    setEditingCow(cow);
    setFormName(cow.name);
    setModalVisible(true);
  };

  const handleDelete = (id: number) => {
    Alert.alert("Hapus Sapi", "Apakah Anda yakin ingin menghapus sapi ini?", [
      { text: "Batal", style: "cancel" },
      {
        text: "Hapus",
        style: "destructive",
        onPress: async () => {
          try {
            setIsLoading(true);
            await deleteCow(id);
            await fetchCows();
          } catch (e) {
            Alert.alert("Gagal", "Gagal menghapus sapi.");
            setIsLoading(false);
          }
        },
      },
    ]);
  };

  const handleSave = async () => {
    if (!formName.trim()) {
      Alert.alert("Error", "Nama sapi tidak boleh kosong");
      return;
    }

    try {
      setIsSubmitting(true);
      if (editingCow) {
        await updateCow(editingCow.id, { name: formName });
      } else {
        await createCow({ name: formName });
      }
      setModalVisible(false);
      await fetchCows();
    } catch (e) {
      Alert.alert("Error", "Gagal menyimpan data sapi");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCows = cows.filter(
    (cow) =>
      cow.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(cow.id).includes(searchQuery)
  );

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.headerBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Daftar Sapi Saya</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Content */}
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Page Info & Search */}
          <View style={styles.pageInfoContainer}>
            <View style={styles.breadcrumbRow}>
              <Text style={styles.breadcrumbText}>Manajemen </Text>
              <Feather name="chevron-right" size={12} color={theme.textSecondary} />
              <Text style={styles.breadcrumbActiveText}> Daftar Sapi</Text>
            </View>
            <Text style={styles.pageTitleText}>Kelola Ternak Anda</Text>
            <Text style={styles.pageDescription}>
              Total {cows.length} ekor sapi terpantau secara real-time.
            </Text>
            
            <View style={styles.searchRow}>
              <View
                style={[
                  styles.searchContainer,
                  {
                    flex: 1,
                    backgroundColor: theme.card,
                    borderColor: colorScheme === "dark" ? theme.border : "#EBEBEB",
                    marginRight: 12,
                  },
                ]}
              >
                <Feather
                  name="search"
                  size={20}
                  color={theme.textSecondary}
                  style={styles.searchIcon}
                />
                <TextInput
                  style={[styles.searchInput, { color: theme.text }]}
                  placeholder="Cari nama atau ID..."
                  placeholderTextColor={theme.textSecondary}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>
              <TouchableOpacity
                style={styles.addButtonCircle}
                activeOpacity={0.8}
                onPress={handleOpenAdd}
              >
                <Feather name="plus" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>
          </View>

          {isLoading && cows.length === 0 ? (
            <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 20 }} />
          ) : filteredCows.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="cow" size={64} color={theme.textSecondary} style={{ opacity: 0.5 }} />
              <Text style={styles.emptyText}>
                {searchQuery ? "Data sapi tidak ditemukan" : "Belum ada sapi yang terdaftar"}
              </Text>
            </View>
          ) : (
            filteredCows.map((cow) => (
              <View key={cow.id} style={styles.cowCard}>
                <View style={[styles.cowAvatar, { backgroundColor: colorScheme === "dark" ? "#424242" : "#1A262E" }]}>
                  <MaterialCommunityIcons name="cow" size={28} color="#FFF" />
                </View>
                <View style={styles.cowInfo}>
                  <Text style={styles.cowName}>{cow.name}</Text>
                  <Text style={styles.cowSub}>ID: {cow.id}</Text>
                  <Text style={styles.cowSub} numberOfLines={1}>
                    Tgl Daftar: {new Date(cow.createdAt).toLocaleDateString("id-ID")}
                  </Text>
                </View>
                <View style={styles.actionRow}>
                  <TouchableOpacity style={styles.actionBtnEdit} onPress={() => handleOpenEdit(cow)}>
                    <Feather name="edit-2" size={16} color="#4CAF50" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionBtnDelete} onPress={() => handleDelete(cow.id)}>
                    <Feather name="trash-2" size={16} color="#F44336" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </ScrollView>



        {/* Form Modal */}
        <Modal visible={modalVisible} transparent animationType="slide">
          <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
            <View style={styles.modalOverlay} />
          </TouchableWithoutFeedback>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={styles.modalContainer}
          >
            <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{editingCow ? "Edit Sapi" : "Data Sapi"}</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                  <Feather name="x" size={20} color={theme.textSecondary} />
                </TouchableOpacity>
              </View>

              <Text style={styles.inputLabel}>Nama Sapi</Text>
              <TextInput
                style={[
                  styles.textInput,
                  { color: theme.text, borderColor: colorScheme === "dark" ? theme.border : "#E0E0E0" },
                ]}
                placeholder="cth. Limon"
                placeholderTextColor={theme.textSecondary}
                value={formName}
                onChangeText={setFormName}
                autoCapitalize="words"
              />

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
    pageInfoContainer: {
      marginBottom: 20,
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
    pageTitleText: {
      fontFamily: "Manrope-ExtraBold",
      fontSize: 20,
      color: theme.text,
      marginBottom: 4,
    },
    pageDescription: {
      fontFamily: "Manrope-Medium",
      fontSize: 13,
      color: theme.textSecondary,
      marginBottom: 16,
    },
    searchRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    searchContainer: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderRadius: 16,
      paddingHorizontal: 16,
      height: 48,
    },
    searchIcon: {
      marginRight: 10,
    },
    searchInput: {
      flex: 1,
      fontFamily: "Manrope-Medium",
      fontSize: 14,
      height: "100%",
    },
    addButtonCircle: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: "#1B5E20",
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#1B5E20",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    emptyContainer: {
      alignItems: "center",
      justifyContent: "center",
      marginTop: 80,
    },
    emptyText: {
      fontFamily: "Manrope-Medium",
      fontSize: 14,
      color: theme.textSecondary,
      marginTop: 16,
    },
    cowCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.card,
      borderRadius: 20,
      padding: 16,
      marginBottom: 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: colorScheme === "dark" ? 0.2 : 0.04,
      shadowRadius: 8,
      elevation: 2,
    },
    cowAvatar: {
      width: 50,
      height: 50,
      borderRadius: 16,
      marginRight: 16,
      alignItems: "center",
      justifyContent: "center",
    },
    cowInfo: {
      flex: 1,
    },
    cowName: {
      fontFamily: "Manrope-ExtraBold",
      fontSize: 16,
      color: theme.text,
      marginBottom: 4,
    },
    cowSub: {
      fontFamily: "Manrope-Medium",
      fontSize: 12,
      color: theme.textSecondary,
    },
    actionRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    actionBtnEdit: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colorScheme === "dark" ? "#1B5E20" : "#E8F5E9",
      alignItems: "center",
      justifyContent: "center",
      marginRight: 8,
    },
    actionBtnDelete: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colorScheme === "dark" ? "#D32F2F" : "#FFEBEE",
      alignItems: "center",
      justifyContent: "center",
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
    },
    textInput: {
      fontFamily: "Manrope-Medium",
      fontSize: 15,
      borderWidth: 1,
      borderRadius: 16,
      paddingHorizontal: 16,
      paddingVertical: 14,
      marginBottom: 24,
    },
    saveBtn: {
      backgroundColor: "#4CAF50",
      paddingVertical: 16,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
    },
    saveBtnText: {
      fontFamily: "Manrope-Bold",
      fontSize: 16,
      color: "#FFF",
    },
  });
