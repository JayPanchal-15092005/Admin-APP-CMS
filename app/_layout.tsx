import { API_BASE_URL } from "@/constants/Config";
import { ClerkLoaded, ClerkProvider } from "@clerk/clerk-expo";
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { Stack } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect } from "react";

const tokenCache = {
  async getToken(key: string) {
    return SecureStore.getItemAsync(key);
  },
  async saveToken(key: string, value: string) {
    return SecureStore.setItemAsync(key, value);
  },
};

export default function RootLayout() {
  
  useEffect(() => {
  const registerAdminPush = async () => {
    try {
      // 1. Get Project ID
      const projectId = Constants.expoConfig?.extra?.eas?.projectId;
      if (!projectId) {
        console.error("Missing Project ID! Check your app.json");
        return;
      }

      // 2. Request Permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') return;

      // 3. Get the Token specifically for this build (APK vs Expo Go)
      const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
      const token = tokenData.data;

      // 4. IMPORTANT: Log this token to your console or an Alert 
      // so you can see if it changed when you installed the APK
      console.log("Current Device Token:", token);

      // 5. Fetch the email - ensure this is set during login!
      const currentAdminEmail = await SecureStore.getItemAsync("adminEmail"); 

      if (currentAdminEmail && token) {
        const response = await fetch(`${API_BASE_URL}/api/admin/devices/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            email: currentAdminEmail, 
            expoPushToken: token // This will overwrite the old Expo Go token
          }),
        });

        if (response.ok) {
          console.log("Admin APK successfully registered!");
        }
      }
    } catch (err) {
      console.error("Admin push registration failed:", err);
    }
  };

  registerAdminPush();
}, []);

  const publishableKey =
    Constants.expoConfig?.extra?.CLERK_PUBLISHABLE_KEY ||
    process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (!publishableKey) {
    throw new Error("Missing Clerk publishable key");
  }

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <ClerkLoaded>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(admin)" />
        </Stack>
      </ClerkLoaded>
    </ClerkProvider>
  );
}
