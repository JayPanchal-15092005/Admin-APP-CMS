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

export default function RechargeDashboard() {
  const router = useRouter();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRequests = async () => {
    try {
      const email = await SecureStore.getItemAsync("adminEmail");
      const password = await SecureStore.getItemAsync("adminPassword");

      const response = await fetch(`${API_BASE_URL}api/admin/mob-recharges`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-admin-email": email || "",
          "x-admin-password": password || "",
        },
      });

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

    return (
      <View style={styles.card}>
        <View style={styles.cardInfo}>
          <Text style={styles.name}>{item.employee_name}</Text>
          <Text style={styles.date}>
            {formattedDate} • ₹{item.recharge_amount || "N/A"}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.viewButton}
          onPress={() =>
            router.push({
              pathname: "/(admin)/recharge/recharge-details",
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
        <Text style={styles.title}>Recharges</Text>
        <Text style={styles.subtitle}>Mobile Allowance Requests</Text>
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#8b5cf6"
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
              colors={["#8b5cf6"]}
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
    borderLeftColor: "#8b5cf6", // Purple indicator
    elevation: 2,
  },
  cardInfo: { flex: 1 },
  name: { fontSize: 16, fontWeight: "bold", color: "#1e293b", marginBottom: 4 },
  date: { fontSize: 13, color: "#64748b" },
  viewButton: {
    backgroundColor: "#f3e8ff",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#8b5cf6",
  },
  viewButtonText: { color: "#7e22ce", fontWeight: "bold" },
});
