import { Colors, Fonts } from "@/constants/theme";
import { login } from "@/services/api";
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

export default function LoginScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const { saveAuth, isLoading, setLoading } = useAuthStore();
  const styles = getStyles(theme, colorScheme);

  const handleLogin = async (): Promise<void> => {
    if (!email || !password) {
      Alert.alert("Error", "Email dan password wajib diisi");
      return;
    }

    try {
      setLoading(true);
      const response = await login({ email, password });
      const { data } = response.data;
      await saveAuth(
        { id: data.id, name: data.name, email: data.email },
        data.token,
      );
      router.replace("/(tabs)");
    } catch (error: any) {
      const message = error.response?.data?.error || "Login gagal";
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
          <Text style={styles.appName}>Sistem Monitoring Sapi</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Selamat Datang</Text>
          <Text style={styles.subtitle}>Masuk untuk mengelola ternak Anda</Text>

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
            <View style={styles.passwordLabelContainer}>
              <Text style={styles.label}>KATA SANDI</Text>
              <TouchableOpacity>
                <Text style={styles.forgotPassword}>Lupa sandi?</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.inputContainer}>
              <Feather
                name="lock"
                size={20}
                color={theme.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="••••••••"
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

          <TouchableOpacity
            style={styles.button}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={theme.white} />
            ) : (
              <View style={styles.buttonContent}>
                <Text style={styles.buttonText}>Masuk ke Dashboard</Text>
                <Feather
                  name="arrow-right"
                  size={20}
                  color={theme.white}
                  style={{ marginLeft: 8 }}
                />
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Belum punya akun? </Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
              <Text style={styles.registerTextBold}>Daftar di sini</Text>
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
    passwordLabelContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
    },
    forgotPassword: {
      fontSize: 12,
      fontFamily: "Manrope-SemiBold",
      color: theme.primary,
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
    registerContainer: {
      flexDirection: "row",
      justifyContent: "center",
      marginTop: 32,
    },
    registerText: {
      color: theme.textSecondary,
      fontSize: 13,
      fontFamily: Fonts.sans,
    },
    registerTextBold: {
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
