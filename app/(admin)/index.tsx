import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AdminDashboardScreen() {
  const router = useRouter();

  // Array of your 4 modules based on your Eraser design
  const modules = [
    {
      id: "cms",
      title: "CMS Forms",
      subtitle: "Manage IT Complaints",
      icon: "🏢",
      route: "/(admin)/cms",
      color: "#3b82f6", // Blue
    },
    {
      id: "daily-reports",
      title: "Daily Reports",
      subtitle: "View Employee Work",
      icon: "📝",
      route: "/(admin)/daily-reports",
      color: "#10b981", // Green
    },
    {
      id: "stationery",
      title: "Stationery Req",
      subtitle: "Office Supplies",
      icon: "✏️",
      route: "/(admin)/stationery/dashboard",
      color: "#f59e0b", // Orange
    },
    {
      id: "recharge",
      title: "Mob Recharge",
      subtitle: "Phone Allowances",
      icon: "📱",
      route: "/(admin)/recharge/dashboard",
      color: "#8b5cf6", // Purple
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.wrapper}>
        {/* Header Section */}
        <LinearGradient
          colors={["#1f2937", "#111827", "#000000"]}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <Text style={styles.adminBadge}>ADMIN PORTAL</Text>
            <Text style={styles.headerTitle}>Overview</Text>
            <Text style={styles.headerSubtitle}>
              Select a module to view data and reports
            </Text>
          </View>
        </LinearGradient>

        {/* Grid Section */}
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
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 40,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    alignItems: "flex-start",
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
  scrollView: {
    flex: 1,
    marginTop: -20, // Pulls the grid up slightly over the curved header
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
    width: "47%", // Leaves room for the gap
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
