import { Colors, Fonts } from "@/constants/theme";
import { register } from "@/services/api";
import { useAuthStore } from "@/stores/authStore";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

export default function RegisterScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);
  const { saveAuth, isLoading, setLoading } = useAuthStore();
  const styles = getStyles(theme, colorScheme);

  const handleRegister = async (): Promise<void> => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert("Error", "Semua field wajib diisi");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Password tidak sama");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Error", "Password minimal 6 karakter");
      return;
    }

    try {
      setLoading(true);
      const response = await register({ name, email, password });
      const { data } = response.data;
      await saveAuth(
        { id: data.id, name: data.name, email: data.email },
        data.token,
      );
      router.replace("/(tabs)");
    } catch (error: any) {
      const message = error.response?.data?.error || "Registrasi gagal";
      Alert.alert("Error", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <MaterialCommunityIcons
              name="grass"
              size={40}
              color={theme.white}
            />
          </View>
          <Text style={styles.appName}>Smart Cattle</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Daftar Akun Baru</Text>
          <Text style={styles.subtitle}>
            Daftar untuk mengelola ternak Anda
          </Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>NAMA LENGKAP</Text>
            <View style={styles.inputContainer}>
              <Feather
                name="user"
                size={20}
                color={theme.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="John Doe"
                placeholderTextColor={theme.textSecondary}
                value={name}
                onChangeText={setName}
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>EMAIL</Text>
            <View style={styles.inputContainer}>
              <Feather
                name="mail"
                size={20}
                color={theme.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="nama@email.com"
                placeholderTextColor={theme.textSecondary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>KATA SANDI</Text>
            <View style={styles.inputContainer}>
              <Feather
                name="lock"
                size={20}
                color={theme.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Minimal 6 karakter"
                placeholderTextColor={theme.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Feather
                  name={showPassword ? "eye" : "eye-off"}
                  size={20}
                  color={theme.textSecondary}
                  style={styles.inputEyeIcon}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>KONFIRMASI KATA SANDI</Text>
            <View style={styles.inputContainer}>
              <Feather
                name="lock"
                size={20}
                color={theme.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Ulangi password"
                placeholderTextColor={theme.textSecondary}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Feather
                  name={showConfirmPassword ? "eye" : "eye-off"}
                  size={20}
                  color={theme.textSecondary}
                  style={styles.inputEyeIcon}
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={theme.white} />
            ) : (
              <View style={styles.buttonContent}>
                <Text style={styles.buttonText}>Daftar Akun</Text>
                <Feather
                  name="user-plus"
                  size={20}
                  color={theme.white}
                  style={{ marginLeft: 8 }}
                />
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Sudah punya akun? </Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.loginTextBold}>Masuk di sini</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.trustedByContainer}>
          <Text style={styles.trustedByText}>TRUSTED BY</Text>
          <View style={styles.trustedByLine} />
          <Feather
            name="bar-chart-2"
            size={18}
            color={theme.textSecondary}
            style={styles.trustedIcon}
          />
          <Feather
            name="shield"
            size={18}
            color={theme.textSecondary}
            style={styles.trustedIcon}
          />
          <Feather
            name="cloud"
            size={18}
            color={theme.textSecondary}
            style={styles.trustedIcon}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const getStyles = (theme: any, colorScheme: string) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colorScheme === "dark" ? theme.background : "#F4F6F8",
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: "center",
      padding: 24,
    },
    header: {
      alignItems: "center",
      marginBottom: 32,
      marginTop: 20,
    },
    logoContainer: {
      backgroundColor: theme.primary,
      width: 64,
      height: 64,
      borderRadius: 18,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 16,
    },
    appName: {
      fontSize: 24,
      fontFamily: "Manrope-ExtraBold",
      color: colorScheme === "dark" ? theme.text : "#1E1E1E",
      textAlign: "center",
      letterSpacing: -0.5,
    },
    card: {
      backgroundColor: theme.card,
      borderRadius: 32,
      padding: 24,
      paddingTop: 32,
      paddingBottom: 32,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.05,
      shadowRadius: 20,
      elevation: 5,
    },
    title: {
      fontSize: 22,
      fontFamily: "Manrope-Bold",
      color: colorScheme === "dark" ? theme.text : "#1E1E1E",
      textAlign: "center",
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 13,
      fontFamily: Fonts.sans,
      color: theme.textSecondary,
      textAlign: "center",
      marginBottom: 32,
    },
    formGroup: {
      marginBottom: 20,
    },
    label: {
      fontSize: 12,
      fontFamily: "Manrope-Bold",
      color: colorScheme === "dark" ? theme.textSecondary : "#333",
      marginBottom: 8,
      letterSpacing: 1,
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colorScheme === "dark" ? "#2A2A2A" : "#F5F7F9",
      borderRadius: 100,
      paddingHorizontal: 16,
      height: 52,
    },
    inputIcon: {
      marginRight: 10,
    },
    inputEyeIcon: {
      marginLeft: 10,
      padding: 4,
    },
    input: {
      flex: 1,
      fontSize: 14,
      fontFamily: Fonts.sans,
      color: theme.text,
      height: "100%",
    },
    button: {
      backgroundColor: theme.primary,
      borderRadius: 100,
      height: 52,
      justifyContent: "center",
      alignItems: "center",
      marginTop: 8,
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 4,
    },
    buttonContent: {
      flexDirection: "row",
      alignItems: "center",
    },
    buttonText: {
      color: theme.white,
      fontSize: 15,
      fontFamily: "Manrope-Bold",
    },
    loginContainer: {
      flexDirection: "row",
      justifyContent: "center",
      marginTop: 32,
    },
    loginText: {
      color: theme.textSecondary,
      fontSize: 13,
      fontFamily: Fonts.sans,
    },
    loginTextBold: {
      color: theme.primary,
      fontFamily: "Manrope-Bold",
      fontSize: 13,
    },
    trustedByContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginTop: 32,
    },
    trustedByText: {
      fontSize: 10,
      fontFamily: "Manrope-Bold",
      color: theme.textSecondary,
      letterSpacing: 1,
      marginRight: 8,
    },
    trustedByLine: {
      width: 32,
      height: 1,
      backgroundColor: theme.border,
      marginRight: 12,
    },
    trustedIcon: {
      marginHorizontal: 8,
    },
  });
