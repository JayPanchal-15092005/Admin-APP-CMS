import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Alert, ScrollView } from "react-native";
import * as SecureStore from "expo-secure-store";
import { documentDirectory, writeAsStringAsync, EncodingType } from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { Ionicons } from "@expo/vector-icons";
import { API_BASE_URL } from "@/constants/Config";
import { SafeAreaView } from "react-native-safe-area-context";

interface StationeryDetails {
  created_at: string;
  employee_name: string;
  employee_email: string;
  work_details: string;
  items?: Array<{ quantity: number; item_name: string }>;
}

export default function StationeryAnalytics() {
  const [requests, setRequests] = useState<StationeryDetails[]>([]);
  const [stats, setStats] = useState({ today: 0, week: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const email = await SecureStore.getItemAsync("adminEmail");
        const password = await SecureStore.getItemAsync("adminPassword");

        const response = await fetch(`${API_BASE_URL}api/admin/stationery-requests`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "x-admin-email": email || "",
            "x-admin-password": password || ""
          },
        });
        
        const result = await response.json();
        if (result.success) {
          const data = result.data;
          setRequests(data);
          
          // 🟢 Time-Based Logic
          const now = new Date();
          const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
          const weekStart = todayStart - (7 * 24 * 60 * 60 * 1000);

          let todayCount = 0;
          let weekCount = 0;

          data.forEach((item: StationeryDetails) => {
            const itemTime = new Date(item.created_at).getTime();
            if (itemTime >= todayStart) todayCount++;
            if (itemTime >= weekStart) weekCount++;
          });

          setStats({ today: todayCount, week: weekCount, total: data.length });
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // 🟢 CSV Export Logic (Customized for Array of Items)
  const exportToCSV = async () => {
    if (requests.length === 0) {
      Alert.alert("No Data", "There are no stationery requests to export yet.");
      return;
    }

    setExporting(true);
    try {
      // 1. Create CSV Header
      let csvString = "Date,Time,Employee Name,Email,Requested Items\n";

      // 2. Add Data Rows
      requests.forEach((report) => {
        const d = new Date(report.created_at);
        const dateStr = d.toLocaleDateString('en-GB');
        const timeStr = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }).replace(/\u202F/g, ' ');
        
        const safeName = `"${report.employee_name || "Unknown"}"`;
        const safeEmail = `"${report.employee_email || ""}"`;
        
        // Flatten the items array into a clean string (e.g. "3x Pen, 1x Notebook")
        let itemsText = "";
        if (report.items && report.items.length > 0) {
          itemsText = report.items.map(i => `${i.quantity}x ${i.item_name}`).join(', ');
        } else {
          itemsText = "No items";
        }
        const safeItems = `"${itemsText.replace(/"/g, '""')}"`;

        csvString += `${dateStr},${timeStr},${safeName},${safeEmail},${safeItems}\n`;
      });

      // 3. Save to Phone File System
      const fileUri = `${documentDirectory}Stationery_Requests.csv`;
      await writeAsStringAsync(fileUri, csvString, { encoding: EncodingType.UTF8 });

      // 4. Open Share Menu
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: "text/csv",
          dialogTitle: "Share Stationery Data",
          UTI: "public.comma-separated-values-text"
        });
      } else {
        Alert.alert("Error", "Sharing is not available on this device");
      }
    } catch (error) {
      console.error("Export Error:", error);
      Alert.alert("Error", "Failed to generate Excel file.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Analytics</Text>
        <Text style={styles.subtitle}>Stationery Insights & Exports</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#f59e0b" style={{ marginTop: 50 }} />
      ) : (
        <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 40 }}>
          
          {/* Main Today Card */}
          <View style={[styles.statCard, styles.mainCard]}>
            <Text style={styles.statTitle}>Requested Today</Text>
            <Text style={styles.mainNumber}>{stats.today}</Text>
          </View>

          {/* Grid Cards for Week and Total */}
          <View style={styles.gridContainer}>
            <View style={[styles.statCard, styles.gridCard]}>
              <Text style={styles.statTitle}>Last 7 Days</Text>
              <Text style={styles.statNumber}>{stats.week}</Text>
            </View>
            <View style={[styles.statCard, styles.gridCard]}>
              <Text style={styles.statTitle}>All Time</Text>
              <Text style={styles.statNumber}>{stats.total}</Text>
            </View>
          </View>

          {/* Export Button */}
          <View style={styles.exportSection}>
            <Text style={styles.exportText}>Download all stationery requests as a spreadsheet to view in Excel or share via WhatsApp.</Text>
            <TouchableOpacity 
              style={[styles.exportBtn, exporting && { opacity: 0.7 }]} 
              onPress={exportToCSV}
              disabled={exporting}
            >
              <Ionicons name="download-outline" size={24} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.exportBtnText}>
                {exporting ? "Generating CSV..." : "Export to Excel (CSV)"}
              </Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  header: { padding: 20, paddingTop: 50, backgroundColor: "#111827", paddingBottom: 30 },
  title: { fontSize: 28, fontWeight: "bold", color: "#fff" },
  subtitle: { fontSize: 14, color: "#9ca3af", marginTop: 4 },
  content: { flex: 1, padding: 16, marginTop: -20 },
  statCard: {
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    alignItems: "center",
  },
  mainCard: { marginBottom: 16, borderTopWidth: 4, borderTopColor: "#f59e0b" }, // Amber color
  gridContainer: { flexDirection: "row", justifyContent: "space-between", marginBottom: 30 },
  gridCard: { width: "48%", padding: 20 },
  statTitle: { fontSize: 14, color: "#64748b", fontWeight: "600", textAlign: "center" },
  mainNumber: { fontSize: 56, color: "#f59e0b", fontWeight: "bold", marginTop: 8 }, // Amber color
  statNumber: { fontSize: 36, color: "#1e293b", fontWeight: "bold", marginTop: 8 },
  exportSection: {
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 16,
    elevation: 2,
  },
  exportText: { fontSize: 14, color: "#475569", lineHeight: 22, marginBottom: 20, textAlign: "center" },
  exportBtn: {
    backgroundColor: "#2563eb",
    flexDirection: "row",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  exportBtnText: { color: "#fff", fontSize: 16, fontWeight: "bold" }
});