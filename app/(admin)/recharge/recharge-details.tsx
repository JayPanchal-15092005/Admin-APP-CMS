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

export default function RechargeDetails() {
  const router = useRouter();
  const { requestData } = useLocalSearchParams();
  const request = requestData ? JSON.parse(requestData as string) : null;

  if (!request)
    return (
      <Text style={{ marginTop: 50, textAlign: "center" }}>
        Loading details...
      </Text>
    );

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
        <Text style={styles.headerTitle}>Recharge Details</Text>
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

          <Text style={styles.label}>Mobile Number</Text>
          {/* 🟢 CHANGED: Mapping now uses 'mob_no' from your database image */}
          <Text style={styles.highlightValue}>
            {request.mobile_no || "N/A"}
          </Text>

          <Text style={styles.label}>Operator / Provider</Text>
          {/* 🟢 CHANGED: Mapping now uses 'service_provider' from your database image */}
          <Text style={styles.value}>{request.operator || "N/A"}</Text>

          <Text style={styles.label}>Recharge Amount</Text>
          {/* Mapping request.amount is correct based on your image */}
          <Text style={styles.highlightValue}>
            ₹{request.recharge_amount || "0"}
          </Text>
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
  highlightValue: {
    fontSize: 22,
    color: "#8b5cf6",
    fontWeight: "bold",
    marginBottom: 20,
  },
  divider: {
    height: 1,
    backgroundColor: "#e2e8f0",
    marginVertical: 10,
    marginBottom: 20,
  },
});
