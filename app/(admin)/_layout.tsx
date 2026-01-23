// import { Slot } from "expo-router";

// // 🟢 Removed Clerk imports and useUser hook
// export default function AdminLayout() {
//   // We removed the Redirect logic because you are now using
//   // hardcoded credentials in your login screen.
//   // This layout will now simply render your admin pages (Complaints, etc.)
//   return <Slot />;
// }

import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context"; // 🟢 Added

export default function AdminLayout() {
  const insets = useSafeAreaInsets(); // 🟢 Get device bottom inset

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#2563eb",
        tabBarInactiveTintColor: "#64748b",
        // 🟢 FIX: Add padding based on device insets
        tabBarStyle: {
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 10,
          backgroundColor: "#ffffff",
          borderTopWidth: 1,
          borderTopColor: "#e2e8f0",
        },
      }}
    >
      <Tabs.Screen
        name="complain"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color }) => (
            <Ionicons name="speedometer-outline" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: "Reports",
          tabBarIcon: ({ color }) => (
            <Ionicons name="stats-chart-outline" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="complain-details"
        options={{
          href: null, // Keeps it hidden from UI
        }}
      />
    </Tabs>
  );
}
