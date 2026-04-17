import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function StationeryDetails() {
  const router = useRouter();
  const { requestData } = useLocalSearchParams();
  const request = requestData ? JSON.parse(requestData as string) : null;

  if (!request) return <Text>Loading...</Text>;

  const dateObj = new Date(request.created_at);
  const formattedDate =
    dateObj.toLocaleDateString("en-GB") +
    " at " +
    dateObj
      .toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
      .replace(/\u202F/g, " ");

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.label}>Employee Name</Text>
          <Text style={styles.value}>{request.employee_name}</Text>

          <Text style={styles.label}>Email Address</Text>
          <Text style={styles.value}>{request.employee_email}</Text>

          <Text style={styles.label}>Requested On</Text>
          <Text style={styles.value}>{formattedDate}</Text>

          <View style={styles.divider} />

          <Text style={styles.label}>Items Requested</Text>

          {/* Map through the items array */}
          {request.items && request.items.length > 0 ? (
            request.items.map((item: any, index: number) => (
              <View key={index} style={styles.itemRow}>
                <View style={styles.bullet} />
                <Text style={styles.itemText}>{item.item_name}</Text>
                <Text style={styles.itemQty}>Qty: {item.quantity}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.detailsText}>
              No items found in this request.
            </Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  header: {
    backgroundColor: "#111827",
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, color: "#fff", fontWeight: "bold" },
  content: { padding: 16 },
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    elevation: 3,
  },
  label: {
    fontSize: 13,
    color: "#64748b",
    textTransform: "uppercase",
    fontWeight: "bold",
    marginBottom: 4,
  },
  value: { fontSize: 16, color: "#1e293b", marginBottom: 20 },
  divider: {
    height: 1,
    backgroundColor: "#e2e8f0",
    marginVertical: 10,
    marginBottom: 20,
  },
  detailsText: { fontSize: 15, color: "#334155", fontStyle: "italic" },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  bullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#f59e0b",
    marginRight: 12,
  },
  itemText: { flex: 1, fontSize: 16, color: "#1e293b", fontWeight: "500" },
  itemQty: { fontSize: 14, color: "#64748b", fontWeight: "bold" },
});
