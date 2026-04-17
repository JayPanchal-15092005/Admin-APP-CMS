import { API_BASE_URL } from "@/constants/Config";
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

export default function StationeryDashboard() {
  const router = useRouter();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRequests = async () => {
    try {
      const email = await SecureStore.getItemAsync("adminEmail");
      const password = await SecureStore.getItemAsync("adminPassword");

      const response = await fetch(
        `${API_BASE_URL}api/admin/stationery-requests`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "x-admin-email": email || "",
            "x-admin-password": password || "",
          },
        },
      );

      const result = await response.json();
      if (result.success) setRequests(result.data);
    } catch (error) {
      console.error("Failed to fetch requests:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const renderItem = ({ item }: { item: any }) => {
    const dateObj = new Date(item.created_at);
    const formattedDate = dateObj.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    // Check if item.items exists and is an array to show total items count
    const totalItems = Array.isArray(item.items) ? item.items.length : 0;

    return (
      <View style={styles.card}>
        <View style={styles.cardInfo}>
          <Text style={styles.name}>{item.employee_name}</Text>
          <Text style={styles.date}>
            {formattedDate} • {totalItems} items
          </Text>
        </View>

        <TouchableOpacity
          style={styles.viewButton}
          onPress={() =>
            router.push({
              pathname: "/(admin)/stationery/stationery-details",
              params: { requestData: JSON.stringify(item) },
            })
          }
        >
          <Text style={styles.viewButtonText}>Review</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Stationery</Text>
        <Text style={styles.subtitle}>Office Supply Requests</Text>
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#f59e0b"
          style={{ marginTop: 50 }}
        />
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchRequests();
              }}
              colors={["#f59e0b"]}
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
    borderLeftColor: "#f59e0b", // Amber indicator
    elevation: 2,
  },
  cardInfo: { flex: 1 },
  name: { fontSize: 16, fontWeight: "bold", color: "#1e293b", marginBottom: 4 },
  date: { fontSize: 13, color: "#64748b" },
  viewButton: {
    backgroundColor: "#fffbeb",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#f59e0b",
  },
  viewButtonText: { color: "#d97706", fontWeight: "bold" },
});
