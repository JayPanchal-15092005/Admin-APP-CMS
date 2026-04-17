import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function StationeryLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#f59e0b", // Amber/Orange color for Stationery
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Inbox",
          tabBarIcon: ({ color }) => (
            <Ionicons name="cube" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="report"
        options={{
          title: "Analytics",
          tabBarIcon: ({ color }) => (
            <Ionicons name="stats-chart" size={24} color={color} />
          ),
        }}
      />
      {/* 🟢 HIDDEN SCREEN: Details */}
      <Tabs.Screen
        name="stationery-details"
        options={{
          href: null,
          headerShown: false,
        }}
      />
    </Tabs>
  );
}
