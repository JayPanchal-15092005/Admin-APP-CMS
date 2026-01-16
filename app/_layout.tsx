import { API_BASE_URL } from "@/constants/Config";
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { Stack } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect } from "react";
import { Platform } from "react-native";

const ADMIN_EMAIL = "jayp93393@gmail.com";
const ADMIN_PASSWORD = "JayPanchal15092005";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function RootLayout() {
  useEffect(() => {
    // Register and setup channels on boot
    const setup = async () => {
      await createNotificationChannel();
      await registerForPushNotifications();
    };
    setup();
  }, []);

  const createNotificationChannel = async () => {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default Channel',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
  };

const registerForPushNotifications = async () => {
  try {
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    if (!projectId) return;

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') return;

    const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
    const token = tokenData.data;

    // 🟢 FIX: Check the response to ensure registration worked
    const response = await fetch(`${API_BASE_URL}/api/admin/devices/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD, 
        expoPushToken: token 
      }),
    });

    if (response.ok) {
      console.log("✅ Admin device registered successfully");
      await SecureStore.setItemAsync("adminEmail", ADMIN_EMAIL);
    } else {
      console.error("❌ Admin registration failed:", await response.text());
    }
  } catch (err) {
    console.error("Registration failed", err);
  }
};

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(admin)" />
    </Stack>
  );
}