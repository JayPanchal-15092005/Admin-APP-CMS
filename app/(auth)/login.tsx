import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";

export default function AdminLogin() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // 🟢 Hardcoded credentials provided by you
  const VALID_USERS = [
    { email: "jayp93393@gmail.com", password: "JayPanchal15092005" },
    {
      email: "itsupport@gujaratinfotech.com",
      password: "itsupport@gujaratinfotech.com",
    },
    { email: "gujaratinfotech.com", password: "gujaratinfotech.com" },
  ];

  const onLogin = async () => {
    if (loading) return;

    if (!email || !password) {
      Alert.alert("Validation", "Please enter both email and password");
      return;
    }

    setLoading(true);

    // Simple credential check logic
    const user = VALID_USERS.find(
      (u) => u.email.trim() === email.trim() && u.password === password
    );

    // Simulate a small delay for a real "login" feel
    setTimeout(async () => {
    setLoading(false);
    if (user) {
      // 🟢 2. SAVE THE EMAIL SO NOTIFICATIONS WORK
      try {
        await SecureStore.setItemAsync("adminEmail", user.email);
        
        // 🟢 3. Redirect to Dashboard
        router.replace("/(admin)/complain");
      } catch (e) {
        console.error("Failed to save admin email", e);
      }
    } else {
      Alert.alert("Login Failed", "Invalid email or password");
    }
  }, 600);
};

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.innerContainer}>
        <Text style={styles.title}>Admin Login</Text>
        <Text style={styles.subtitle}>
          Enter your credentials to access the CMS
        </Text>

        <TextInput
          placeholder="Admin Email"
          placeholderTextColor="#94a3b8"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          style={styles.input}
        />

        <TextInput
          placeholder="Password"
          placeholderTextColor="#94a3b8"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={onLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Sign In</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.footerText}>
          CMS Admin Portal v2.0
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a" },
  innerContainer: { flex: 1, justifyContent: "center", padding: 28 },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#fff",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#94a3b8",
    textAlign: "center",
    marginBottom: 32,
  },
  input: {
    backgroundColor: "#1e293b",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    color: "#fff",
    borderWidth: 1,
    borderColor: "#334155",
  },
  button: {
    backgroundColor: "#2563eb",
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
    elevation: 5,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "700" },
  footerText: {
    color: "#475569",
    textAlign: "center",
    marginTop: 40,
    fontSize: 12,
  },
});
