import { API_BASE_URL } from "@/constants/Config";
import { getAdminHeaders } from "@/constants/adminAuth";
import DateTimePicker from "@react-native-community/datetimepicker";
import { File, Paths } from "expo-file-system";
import { LinearGradient } from "expo-linear-gradient";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert, // 🟢 ADDED: For error messages
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const adminEmail = "jayp93393@gmail.com";
const adminPassword = "JayPanchal15092005";

// 🟢 Departments list
const DEPARTMENTS = ["All", "IT", "HR", "Software", "BOB", "SBI", "CBI", "GGB"];

export default function ReportScreen() {
  const [loading, setLoading] = useState(false);
  const [selectedDept, setSelectedDept] = useState("All");
  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  ); // Default: 7 days ago
  const [endDate, setEndDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState<{
    type: "start" | "end";
    show: boolean;
  }>({ type: "start", show: false });

  const [reportData, setReportData] = useState<any>(null);

  // 🟢 NEW: CSV Export Function
  const exportCSV = async () => {
    if (!reportData || !reportData.deptStats) {
      Alert.alert("No Data", "There is no data to export.");
      return;
    }

    try {
      // 1. Create the CSV Header Row
      let csvString =
        "Department,Total Complaints,Resolved,Pending,High Priority\n";

      // 2. Add the Data Rows
      reportData.deptStats.forEach((dept: any) => {
        const pending = dept.total - dept.resolved;
        csvString += `${dept.department},${dept.total},${dept.resolved},${pending},${dept.high_priority || 0}\n`;
      });

      // 3. Add a Summary Row at the bottom
      csvString += `\nSUMMARY,${reportData.summary.total},${reportData.summary.resolved},${reportData.summary.pending},${reportData.summary.high_priority}\n`;

      // 4. Create a file path on the phone
      const filename = `CMS_Report_${startDate.toISOString().split("T")[0]}_to_${endDate.toISOString().split("T")[0]}.csv`;
      const file = new File(Paths.document, filename);

      // 5. Write the CSV string to the file (overwrite if it already exists)
      file.create({ overwrite: true });
      file.write(csvString);

      // 6. Share the file using the new file.uri!
      await Sharing.shareAsync(file.uri, {
        mimeType: "text/csv",
        dialogTitle: "Export CMS Report Data",
        UTI: "public.comma-separated-values-text",
      });
    } catch (error) {
      console.error("CSV Export Error:", error);
      Alert.alert("Export Failed", "Could not generate the CSV file.");
    }
  };

  const exportPDF = async () => {
    if (!reportData) return;

    const html = `
  <html>
    <body style="font-family: sans-serif; padding: 20px;">
      <h1 style="color: #2563eb;">CMS Admin Analytics Report</h1>
      <p><b>Date Range:</b> ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}</p>
      <p><b>Filtered Department:</b> ${selectedDept}</p>
      <hr/>
      
      <h2 style="color: #1e293b;">Overall Summary</h2>
      <div style="background-color: #f8fafc; padding: 15px; border-radius: 10px;">
        <p><b>Total Complaints:</b> ${reportData.summary.total}</p>
        <p><b>Resolved:</b> ${reportData.summary.resolved}</p>
        <p style="color: #f59e0b;"><b>Pending:</b> ${reportData.summary.pending}</p>
        <hr/>
        <p style="color: #ef4444;"><b>High Priority:</b> ${reportData.summary.high_priority}</p>
        <p style="color: #f59e0b;"><b>Medium Priority:</b> ${reportData.summary.medium_priority || 0}</p>
        <p style="color: #10b981;"><b>Low Priority:</b> ${reportData.summary.low_priority || 0}</p>
      </div>

      <h2>Department Breakdown</h2>
      <table border="1" style="width:100%; border-collapse: collapse;">
        <tr style="background-color: #f1f5f9;">
          <th style="padding: 10px;">Department</th>
          <th>Total</th>
          <th>Resolved</th>
        </tr>
        ${reportData.deptStats
          .map(
            (d: any) => `
          <tr>
            <td style="padding: 10px;">${d.department}</td>
            <td align="center">${d.total}</td>
            <td align="center">${d.resolved}</td>
          </tr>
        `,
          )
          .join("")}
      </table>
    </body>
  </html>
`;

    try {
      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri, {
        UTI: ".pdf",
        mimeType: "application/pdf",
      });
    } catch (error) {
      console.error("PDF Export Error:", error);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [selectedDept]);

  // const fetchAnalytics = async () => {
  //   setLoading(true);
  //   try {
  //     const sDate = startDate.toISOString().split("T")[0];
  //     const eDate = endDate.toISOString().split("T")[0];

  //     const url = `${API_BASE_URL}/api/admin/reports?startDate=${sDate}&
  //     endDate=${eDate}&department=${selectedDept}`;

  //     const res = await fetch(url, {
  //       headers: getAdminHeaders(adminEmail, adminPassword),
  //     });
  //     const data = await res.json();
  //     setReportData(data);
  //   } catch (error) {
  //     console.error("Analytics Error:", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // 🟢 FIX: Extract exact local date to stop the "yesterday" Timezone bug
      const sDate = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, "0")}-${String(startDate.getDate()).padStart(2, "0")}`;
      const eDate = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, "0")}-${String(endDate.getDate()).padStart(2, "0")}`;

      // 🟢 CORRECTED: Added department to URL
      const url = `${API_BASE_URL}/api/admin/reports?startDate=${sDate}&endDate=${eDate}&department=${selectedDept}`;

      const res = await fetch(url, {
        headers: getAdminHeaders(adminEmail, adminPassword),
      });
      const data = await res.json();
      setReportData(data);
    } catch (error) {
      console.error("Analytics Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowPicker({ ...showPicker, show: false });
    if (selectedDate) {
      if (showPicker.type === "start") setStartDate(selectedDate);
      else setEndDate(selectedDate);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <LinearGradient colors={["#3b82f6", "#2563eb"]} style={styles.header}>
        <Text style={styles.headerTitle}>Analytics Report</Text>
      </LinearGradient>

      <View style={styles.content}>
        <Text style={styles.cardLabel}>🏢 Filter by Department</Text>
        <ScrollView
          horizontal
          style={styles.deptSelector}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.deptSelectorContent}
        >
          {DEPARTMENTS.map((dept) => (
            <TouchableOpacity
              key={dept}
              style={[
                styles.deptChip,
                selectedDept === dept && styles.activeChip,
              ]}
              onPress={() => setSelectedDept(dept)}
            >
              <Text
                style={[
                  styles.deptChipText,
                  selectedDept === dept && styles.activeChipText,
                ]}
              >
                {dept}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Date Filters */}
        <View style={styles.filterCard}>
          <Text style={styles.cardLabel}>📅 Select Date Range</Text>
          <View style={styles.dateRow}>
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => setShowPicker({ type: "start", show: true })}
            >
              <Text style={styles.dateText}>
                {startDate.toLocaleDateString()}
              </Text>
            </TouchableOpacity>
            <Text style={styles.arrow}>→</Text>
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => setShowPicker({ type: "end", show: true })}
            >
              <Text style={styles.dateText}>
                {endDate.toLocaleDateString()}
              </Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.applyBtn} onPress={fetchAnalytics}>
            <Text style={styles.applyBtnText}>Apply Filter</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#2563eb"
            style={{ marginTop: 20 }}
          />
        ) : reportData ? (
          <>
            {/* 🟢 MODIFIED: Export Buttons Row */}
            <View style={styles.exportButtonRow}>
              <TouchableOpacity style={styles.csvBtn} onPress={exportCSV}>
                <Text style={styles.exportBtnText}>📊 Export CSV</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.pdfBtn} onPress={exportPDF}>
                <Text style={styles.exportBtnText}>📄 Export PDF</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statTitle}>🔥 Priority Insights</Text>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>High Priority Issues</Text>
                <Text style={[styles.statValue, { color: "#ef4444" }]}>
                  {reportData.summary?.high_priority || 0}
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Total in Range</Text>
                <Text style={styles.statValue}>
                  {reportData.summary?.total || 0}
                </Text>
              </View>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statTitle}>🏢 Detailed Department Stats</Text>
              {reportData.deptStats && reportData.deptStats.length > 0 ? (
                reportData.deptStats.map((dept: any, index: number) => (
                  <View key={index} style={styles.deptRow}>
                    <View>
                      <Text style={styles.deptLabel}>{dept.department}</Text>
                      <Text style={styles.deptSubText}>
                        {dept.resolved} / {dept.total} Resolved
                      </Text>
                    </View>
                    <View style={styles.priorityIndicator}>
                      {dept.high_priority > 0 && (
                        <Text style={styles.alertText}>
                          🔥 {dept.high_priority} High
                        </Text>
                      )}
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.noDataText}>
                  No department data available.
                </Text>
              )}
            </View>
          </>
        ) : null}

        {showPicker.show && (
          <DateTimePicker
            value={showPicker.type === "start" ? startDate : endDate}
            mode="date"
            display="default"
            onChange={onDateChange}
          />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  header: {
    padding: 40,
    paddingTop: 60,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "800",
    textAlign: "center",
  },
  content: { padding: 16 },

  deptSelector: {
    marginBottom: 20,
  },
  deptSelectorContent: {
    paddingRight: 20,
    gap: 10,
  },
  deptChip: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginRight: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  activeChip: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },
  deptChipText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748b",
  },
  activeChipText: {
    color: "#ffffff",
  },

  filterCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#64748b",
    marginBottom: 12,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  dateInput: {
    backgroundColor: "#f1f5f9",
    padding: 12,
    borderRadius: 10,
    width: "42%",
    alignItems: "center",
  },
  dateText: { fontWeight: "600", color: "#1e293b" },
  arrow: { fontSize: 20, color: "#94a3b8" },
  applyBtn: {
    backgroundColor: "#2563eb",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  applyBtnText: { color: "#fff", fontWeight: "700" },

  // 🟢 NEW: Styles for the Export Buttons side-by-side
  exportButtonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    gap: 10,
  },
  csvBtn: {
    flex: 1,
    backgroundColor: "#10b981", // Green for Excel/CSV
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    elevation: 2,
  },
  pdfBtn: {
    flex: 1,
    backgroundColor: "#ef4444", // Red for PDF
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    elevation: 2,
  },
  exportBtnText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 15,
  },

  statCard: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  statTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#1e293b",
    marginBottom: 15,
  },
  statItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  statLabel: { color: "#64748b", fontSize: 15 },
  statValue: { fontSize: 18, fontWeight: "800", color: "#1e293b" },
  deptRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  deptLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e293b",
  },
  deptSubText: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 2,
  },
  priorityIndicator: {
    alignItems: "flex-end",
  },
  alertText: {
    color: "#ef4444",
    fontWeight: "800",
    fontSize: 12,
  },
  noDataText: {
    textAlign: "center",
    color: "#94a3b8",
    paddingVertical: 10,
  },
});
