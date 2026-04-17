import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function CMSLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#3b82f6", // Blue color to match your grid card
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopWidth: 1,
          borderTopColor: "#f1f5f9",
          paddingBottom: 5,
          paddingTop: 5,
        },
      }}
    >
      {/* Tab 1: Dashboard */}
      <Tabs.Screen
        name="complain"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color }) => (
            <Ionicons name="pie-chart" size={24} color={color} />
          ),
        }}
      />

      {/* Tab 2: Reports List */}
      <Tabs.Screen
        name="report"
        options={{
          title: "Reports",
          tabBarIcon: ({ color }) => (
            <Ionicons name="document-text" size={24} color={color} />
          ),
        }}
      />

      {/* ⚠️ HIDDEN SCREEN: Complain Details */}
      {/* We set href to null so it DOES NOT show up as a 3rd button on the bottom bar! */}
      <Tabs.Screen
        name="complain-details"
        options={{
          href: null,
          headerShown: false,
        }}
      />
    </Tabs>
  );
}
