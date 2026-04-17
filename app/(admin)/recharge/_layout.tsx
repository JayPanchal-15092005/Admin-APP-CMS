import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function RechargeLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#8b5cf6", // Purple accent color
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Inbox",
          tabBarIcon: ({ color }) => (
            <Ionicons name="phone-portrait" size={24} color={color} />
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
        name="recharge-details"
        options={{
          href: null,
          headerShown: false,
        }}
      />
    </Tabs>
  );
}
