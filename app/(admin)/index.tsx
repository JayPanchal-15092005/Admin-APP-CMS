import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AdminDashboardScreen() {
  const router = useRouter();

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: async () => {
          await SecureStore.deleteItemAsync("adminEmail");
          await SecureStore.deleteItemAsync("adminPassword");
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  const modules = [
    {
      id: "cms",
      title: "CMS Forms",
      subtitle: "Manage IT Complaints",
      icon: "🏢",
      route: "/(admin)/cms",
      color: "#3b82f6",
    },
    {
      id: "daily-reports",
      title: "Daily Reports",
      subtitle: "View Employee Work",
      icon: "📝",
      route: "/(admin)/daily-reports",
      color: "#10b981",
    },
    {
      id: "stationery",
      title: "Stationery Req",
      subtitle: "Office Supplies",
      icon: "✏️",
      route: "/(admin)/stationery/dashboard",
      color: "#f59e0b",
    },
    {
      id: "recharge",
      title: "Mob Recharge",
      subtitle: "Phone Allowances",
      icon: "📱",
      route: "/(admin)/recharge/dashboard",
      color: "#8b5cf6",
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.wrapper}>
        <LinearGradient
          colors={["#1f2937", "#111827", "#000000"]}
          style={styles.header}
        >
          {/* 🟢 BULLETPROOF ROW BOUNDARY */}
          <View style={styles.headerTopRow}>
            <View style={styles.headerContent}>
              <Text style={styles.adminBadge}>ADMIN PORTAL</Text>
              <Text style={styles.headerTitle}>Overview</Text>
              <Text style={styles.headerSubtitle}>
                Select a module to view data and reports
              </Text>
            </View>

            <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
              <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.gridContainer}>
            {modules.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.card}
                activeOpacity={0.8}
                onPress={() => router.push(item.route as any)}
              >
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: `${item.color}15` },
                  ]}
                >
                  <Text style={styles.icon}>{item.icon}</Text>
                </View>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#000000",
  },
  wrapper: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 24, // 🟢 Keeps everything strictly inside the edges
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    width: "100%", // 🟢 Forces the row to respect the padding
  },
  headerContent: {
    flex: 1, // 🟢 Tells text to take available space but no more
    marginRight: 16, // Adds a gap between text and button
  },
  adminBadge: {
    fontSize: 12,
    fontWeight: "800",
    color: "#fbbf24",
    marginBottom: 8,
    letterSpacing: 1.5,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: "#ffffff",
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 15,
    color: "#9ca3af",
    fontWeight: "500",
  },
  signOutBtn: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    flexShrink: 0, // 🟢 CRITICAL: Prevents the button from being squished or hidden
    marginTop: 4, // Slight nudge down to align with the title
  },
  signOutText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "bold",
  },
  scrollView: {
    flex: 1,
    marginTop: -20,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 16,
  },
  card: {
    backgroundColor: "#ffffff",
    width: "47%",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    alignItems: "flex-start",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  icon: {
    fontSize: 24,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "500",
  },
});
