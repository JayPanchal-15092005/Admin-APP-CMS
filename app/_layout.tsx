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
  
  // Inside Admin App _layout.tsx
useEffect(() => {
  const registerAdminPush = async () => {
    try {
      const projectId = Constants.expoConfig?.extra?.eas?.projectId;
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') return;

      const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
      const token = tokenData.data;

      // Use the Admin's email from your hardcoded list or login state
      const currentAdminEmail = await SecureStore.getItemAsync("adminEmail"); 

    if (currentAdminEmail) {
      await fetch(`${API_BASE_URL}/api/admin/devices/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: currentAdminEmail, expoPushToken: token }),
      });
    }
  } catch (err) {
    console.error("Admin push error:", err);
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
