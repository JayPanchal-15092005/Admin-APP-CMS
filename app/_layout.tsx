import { API_BASE_URL } from "@/constants/Config";
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { Stack } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useRef } from "react";
import { Alert, Platform } from "react-native";

// Hardcoded admin credentials
const ADMIN_EMAIL = "jayp93393@gmail.com";
const ADMIN_PASSWORD = "JayPanchal15092005";

// Configure notification handler
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
  const notificationListener = useRef<any>(null);
  const responseListener = useRef<any>(null);

  useEffect(() => {
    // Register for push notifications on app start
    registerForPushNotifications();

    // Listen for notifications
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log("📩 Notification received:", notification);
        // Show alert when notification arrives
        Alert.alert(
          notification.request.content.title || "New Notification",
          notification.request.content.body || "",
        );
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("👆 Notification tapped:", response);
        // Navigate to complaints screen when tapped
        // You can add navigation logic here
      });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  const registerForPushNotifications = async () => {
    try {
      console.log("\n🔔 ========================================");
      console.log("🔔 STARTING PUSH NOTIFICATION REGISTRATION");
      console.log("🔔 ========================================\n");

      // 1. Get Project ID
      const projectId = Constants.expoConfig?.extra?.eas?.projectId;

      if (!projectId) {
        console.error("❌ Missing Project ID!");
        console.error("   Add this to your app.json:");
        console.error(
          '   "extra": { "eas": { "projectId": "your-project-id" } }',
        );
        return;
      }

      console.log("✅ Project ID found:", projectId);

      // 2. Setup Android notification channel
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#FF231F7C",
          sound: "default",
        });
        console.log("✅ Android notification channel created");
      }

      // 3. Request Permissions
      console.log("📱 Checking notification permissions...");
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        console.log("📱 Requesting notification permissions...");
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        console.error("❌ Notification permission DENIED!");
        Alert.alert(
          "Notifications Disabled",
          "Please enable notifications in your device settings to receive complaint alerts.",
          [{ text: "OK" }],
        );
        return;
      }

      console.log("✅ Notification permissions GRANTED");

      // 4. Get Expo Push Token
      console.log("📱 Getting Expo Push Token...");
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId,
      });
      const token = tokenData.data;

      console.log("\n📱 ========================================");
      console.log("📱 EXPO PUSH TOKEN:", token);
      console.log("📱 ========================================\n");

      // 5. Save token locally
      await SecureStore.setItemAsync("expoPushToken", token);
      console.log("✅ Token saved locally");

      // 6. Register device with backend
      console.log("📤 Registering device with backend...");
      console.log("   Admin Email:", ADMIN_EMAIL);
      console.log("   API URL:", `${API_BASE_URL}/api/admin/devices/register`);

      const response = await fetch(
        `${API_BASE_URL}/api/admin/devices/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD, // For verification
            expoPushToken: token,
            deviceInfo: {
              platform: Platform.OS,
              model: Constants.deviceName || "Unknown",
              appVersion: Constants.expoConfig?.version || "1.0.0",
            },
          }),
        },
      );

      const responseText = await response.text();
      console.log("📥 Backend response status:", response.status);
      console.log("📥 Backend response:", responseText);

      if (response.ok) {
        const data = JSON.parse(responseText);
        console.log("\n✅ ========================================");
        console.log("✅ DEVICE REGISTERED SUCCESSFULLY!");
        console.log("✅ ========================================\n");
        console.log("Device Info:", data.device);
      } else {
        console.error("\n❌ ========================================");
        console.error("❌ REGISTRATION FAILED!");
        console.error("❌ ========================================\n");
        console.error("Error:", responseText);
      }
    } catch (err: any) {
      console.error("\n❌ ========================================");
      console.error("❌ PUSH NOTIFICATION REGISTRATION FAILED!");
      console.error("❌ ========================================\n");
      console.error("Error:", err.message);
      console.error("Stack:", err.stack);
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
