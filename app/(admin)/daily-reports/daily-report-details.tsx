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

export default function DailyReportDetails() {
  const router = useRouter();
  const { reportData } = useLocalSearchParams();
  const report = reportData ? JSON.parse(reportData as string) : null;

  if (!report) return <Text>Loading...</Text>;

  const dateObj = new Date(report.created_at);
  const formattedDate =
    dateObj.toLocaleDateString("en-GB") +
    " at " +
    dateObj.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  return (
    <View style={styles.container}>
      {/* Custom Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Report Details</Text>
        <View style={{ width: 24 }} /> {/* Spacer */}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.label}>Employee Name</Text>
          <Text style={styles.value}>{report.employee_name}</Text>

          <Text style={styles.label}>Email Address</Text>
          <Text style={styles.value}>{report.employee_email}</Text>

          <Text style={styles.label}>Submitted On</Text>
          <Text style={styles.value}>{formattedDate}</Text>

          <View style={styles.divider} />

          <Text style={styles.label}>Work Details / Description</Text>
          <Text style={styles.detailsText}>{report.work_details}</Text>
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
  detailsText: { fontSize: 15, color: "#334155", lineHeight: 24 },
});
