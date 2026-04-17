import { API_BASE_URL } from "@/constants/Config"; // Ensure this path is correct!
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function DailyReportDashboard() {
  const router = useRouter();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchReports = async () => {
    try {
      const email = await SecureStore.getItemAsync("adminEmail");
      const password = await SecureStore.getItemAsync("adminPassword");

      const response = await fetch(`${API_BASE_URL}api/admin/daily-reports`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-admin-email": email || "",
          "x-admin-password": password || "",
        },
      });

      const result = await response.json();
      if (result.success) setReports(result.data);
    } catch (error) {
      console.error("Failed to fetch reports:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const renderItem = ({ item }: { item: any }) => {
    const dateObj = new Date(item.created_at);
    const formattedDate = dateObj.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    return (
      <View style={styles.card}>
        <View style={styles.cardInfo}>
          <Text style={styles.name}>{item.employee_name}</Text>
          <Text style={styles.date}>{formattedDate}</Text>
        </View>

        {/* 🟢 View Button */}
        <TouchableOpacity
          style={styles.viewButton}
          onPress={() =>
            router.push({
              pathname: "/(admin)/daily-reports/daily-report-details",
              params: { reportData: JSON.stringify(item) }, // Pass data to next screen
            })
          }
        >
          <Text style={styles.viewButtonText}>View</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Inbox</Text>
        <Text style={styles.subtitle}>Recent Daily Reports</Text>
      </View>

      <TouchableOpacity
        onPress={() => router.replace("/(admin)")}
        style={styles.homeButton}
      >
        <Ionicons name="home" size={24} color="#fff" />
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#10b981"
          style={{ marginTop: 50 }}
        />
      ) : (
        <FlatList
          data={reports}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchReports();
              }}
              colors={["#10b981"]}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  header: {
    padding: 20,
    paddingTop: 50,
    backgroundColor: "#111827",
    paddingBottom: 20,
  },
  // 🟢 Add this new style for the button background
  homeButton: {
    backgroundColor: "#1f2937",
    padding: 10,
    borderRadius: 12,
  },
  title: { fontSize: 28, fontWeight: "bold", color: "#fff" },
  subtitle: { fontSize: 14, color: "#9ca3af", marginTop: 4 },
  listContainer: { padding: 16 },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderLeftWidth: 4,
    borderLeftColor: "#10b981",
    elevation: 2,
  },
  cardInfo: { flex: 1 },
  name: { fontSize: 16, fontWeight: "bold", color: "#1e293b", marginBottom: 4 },
  date: { fontSize: 13, color: "#64748b" },
  viewButton: {
    backgroundColor: "#ecfdf5",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#10b981",
  },
  viewButtonText: { color: "#10b981", fontWeight: "bold" },
});
