import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function DailyReportsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#10b981",
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color }) => (
            <Ionicons name="list" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="report"
        options={{
          title: "Analytics", // Changed title to Analytics
          tabBarIcon: ({ color }) => (
            <Ionicons name="pie-chart" size={24} color={color} />
          ),
        }}
      />
      {/* 🟢 HIDDEN SCREEN: Daily Report Details */}
      <Tabs.Screen
        name="daily-report-details"
        options={{
          href: null,
          headerShown: false,
        }}
      />
    </Tabs>
  );
}
