import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

export default function Index() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      // 🟢 Check if the admin email is saved in storage
      const savedEmail = await SecureStore.getItemAsync("adminEmail");

      if (savedEmail) {
        // ✅ User is already logged in -> Go to Dashboard
        router.replace("/(admin)");
      } else {
        // ❌ No user found -> Go to Login
        router.replace("/(auth)/login");
      }
    } catch (error) {
      console.error("Auto-login error:", error);
      router.replace("/(auth)/login");
    } finally {
      setIsChecking(false);
    }
  };

  // Show a loading spinner while we check
  if (isChecking) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#0f172a",
        }}
      >
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return null;
}
