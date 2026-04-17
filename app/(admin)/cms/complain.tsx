import { getAdminHeaders } from "@/constants/adminAuth";
import { API_BASE_URL } from "@/constants/Config";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const LOGO_IMG = require("@/assets/images/icon.png");

const adminEmail = "jayp93393@gmail.com";
const adminPassword = "JayPanchal15092005";

type Complaint = {
  id: string;
  department: string;
  complain_detail: string;
  status: "Pending" | "Resolved";
  priority?: string;
  created_at?: string;
  complain_location?: string;
  to_whom?: string;
};

export default function AdminComplaints() {
  const router = useRouter();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 🟢 NEW: Filter State (Defaults to 'All')
  const [activeFilter, setActiveFilter] = useState<
    "All" | "Pending" | "Resolved"
  >("All");

  // 🟢 NEW: Search State
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadComplaints();
  }, []);

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: async () => {
          await SecureStore.deleteItemAsync("adminEmail");
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  const loadComplaints = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/complaints`, {
        // I need to change this route to the new backend route
        headers: getAdminHeaders(adminEmail, adminPassword),
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);

      const data = await res.json();
      setComplaints(data.complaints || []);
    } catch (err) {
      console.error("Admin complaints error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    setSearchQuery("");
    loadComplaints();
  };

  // 🟢 UPDATED: Logic to filter by BOTH Status (Buttons) AND Search Text
  const filteredData = complaints.filter((item) => {
    // 1. Check if it matches the active status button
    const matchesStatus =
      activeFilter === "All" || item.status === activeFilter;

    // 2. Check if it matches the search query
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      item.department?.toLowerCase().includes(searchLower) ||
      item.complain_detail?.toLowerCase().includes(searchLower) ||
      item.to_whom?.toLowerCase().includes(searchLower) || // Search by name if available
      item.priority?.toLowerCase().includes(searchLower); // Search by priority

    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    return status === "Resolved" ? "#10b981" : "#f59e0b";
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "#ef4444";
      case "medium":
        return "#f59e0b";
      case "low":
        return "#10b981";
      default:
        return "#6b7280";
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Loading complaints...</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <LinearGradient
        colors={["#3b82f6", "#2563eb", "#1d4ed8"]}
        style={styles.header}
      >
        <View style={styles.topHeaderRow}>
          <View style={styles.titleContainer}>
            <Image
              source={LOGO_IMG}
              style={styles.companyLogo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.headerTitle}>Admin Dashboard</Text>
          <TouchableOpacity
            style={styles.signOutButton}
            onPress={handleSignOut}
          >
            <Text style={styles.signOutText}>Sign Out 🚪</Text>
          </TouchableOpacity>
        </View>

        {/* 🟢 MODIFIED: Stats cards are now Touchable buttons */}
        <View style={styles.statsRow}>
          <TouchableOpacity
            style={[
              styles.statCard,
              activeFilter === "All" && styles.activeStatCard,
            ]}
            onPress={() => setActiveFilter("All")}
          >
            <Text style={styles.statNumber}>{complaints.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.statCard,
              activeFilter === "Pending" && styles.activeStatCard,
            ]}
            onPress={() => setActiveFilter("Pending")}
          >
            <Text style={styles.statNumber}>
              {complaints.filter((c) => c.status === "Pending").length}
            </Text>
            <Text style={styles.statLabel}>Pending</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.statCard,
              activeFilter === "Resolved" && styles.activeStatCard,
            ]}
            onPress={() => setActiveFilter("Resolved")}
          >
            <Text style={styles.statNumber}>
              {complaints.filter((c) => c.status === "Resolved").length}
            </Text>
            <Text style={styles.statLabel}>Resolved</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* 🟢 NEW: Search Bar Component */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color="#9CA3AF"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder={`Search ${activeFilter !== "All" ? activeFilter.toLowerCase() : "all"} complaints...`}
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => setSearchQuery("")}
            style={styles.clearIcon}
          >
            <Ionicons name="close-circle" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filteredData} // 🟢 Use filtered data here
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        initialNumToRender={8} // Only we need draw the first 8 items on initial load
        maxToRenderPerBatch={10} // When scrolling, only render 10 new items at a time
        windowSize={5} // Don't keep too many off-screen items in memory
        removeClippedSubviews={true} // Unmount items that are completely off the screen
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>No {activeFilter} Complaints</Text>
            <Text style={styles.emptySubtitle}>
              There are no complaints matches this status.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.departmentBadge}>
                <Text style={styles.departmentIcon}>🏢</Text>
                <Text style={styles.departmentText}>{item.department}</Text>
              </View>
              {item.priority && (
                <View
                  style={[
                    styles.priorityBadge,
                    { backgroundColor: `${getPriorityColor(item.priority)}20` },
                  ]}
                >
                  <Text
                    style={[
                      styles.priorityText,
                      { color: getPriorityColor(item.priority) },
                    ]}
                  >
                    {item.priority}
                  </Text>
                </View>
              )}
            </View>
            <Text style={styles.detail} numberOfLines={2}>
              {item.complain_detail}
            </Text>
            <View style={styles.actionsRow}>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: `${getStatusColor(item.status)}20` },
                ]}
              >
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: getStatusColor(item.status) },
                  ]}
                />
                <Text
                  style={[
                    styles.statusText,
                    { color: getStatusColor(item.status) },
                  ]}
                >
                  {item.status}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.viewButton}
                onPress={() =>
                  router.push({
                    pathname: "/(admin)/cms/complain-details",
                    params: { id: item.id },
                  })
                }
              >
                <Text style={styles.viewButtonText}>View →</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  // ... Keep all your existing styles ...

  // 🟢 ADDED: Style for the active/selected button
  activeStatCard: {
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    borderColor: "#ffffff",
    borderWidth: 2,
  },

  // (Include all other styles you already have in your file below)
  wrapper: { flex: 1, backgroundColor: "#f8fafc" },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 8,
  },
  // 🟢 NEW: Search Bar Styles
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 4, // Slight margin to detach it from the list
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 15,
    color: "#1F2937",
  },
  clearIcon: {
    padding: 4,
  },
  topHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#ffffff",
    flexShrink: 1,
  },
  titleContainer: { flexDirection: "row", alignItems: "center", gap: 10 },
  companyLogo: { width: 32, height: 32, borderRadius: 6 },
  statsRow: { flexDirection: "row", gap: 12 },
  statCard: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "800",
    color: "#ffffff",
    marginBottom: 2,
  },
  statLabel: { fontSize: 12, color: "#dbeafe", fontWeight: "600" },
  list: { padding: 16, paddingBottom: 32 },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
  },
  signOutButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.4)",
  },
  signOutText: { color: "#ffffff", fontWeight: "700", fontSize: 13 },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  departmentBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eff6ff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  departmentIcon: { fontSize: 14 },
  departmentText: { fontSize: 14, fontWeight: "700", color: "#2563eb" },
  priorityBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  priorityText: { fontSize: 12, fontWeight: "700" },
  detail: { fontSize: 15, color: "#475569", lineHeight: 22, marginBottom: 12 },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 13, fontWeight: "700" },
  viewButton: {
    backgroundColor: "#eff6ff",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  viewButtonText: { fontSize: 14, fontWeight: "700", color: "#2563eb" },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#64748b",
    fontWeight: "500",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 8,
  },
  emptySubtitle: { fontSize: 14, color: "#64748b", textAlign: "center" },
});
