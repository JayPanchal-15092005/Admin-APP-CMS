import { getAdminHeaders } from "@/constants/adminAuth";
import { API_BASE_URL } from "@/constants/Config";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type ComplaintDetails = {
  id: string;
  department: string;
  complain_detail: string;
  status: string;
  created_at: string;
  priority?: string;
  complain_location?: string;
  to_whom?: string;
  submitter_name?: string;
  submitter_email?: string;
  assets?: string[];
  admin_remarks?: string;
};

const adminEmail = "jayp93393@gmail.com";
const adminPassword = "JayPanchal15092005";

export default function ComplaintDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [complaint, setComplaint] = useState<ComplaintDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState(false);
  const [remarks, setRemarks] = useState("");

  useEffect(() => {
    setRemarks("");
    loadDetails();
  }, [id]);

  const loadDetails = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/complaints/${id}`, {
        headers: getAdminHeaders(adminEmail, adminPassword),
      });

      if (!res.ok) {
        throw new Error("Complaint not found");
      }

      const data = await res.json();
      setComplaint(data.complaint);
    } catch (err) {
      console.error("Details error:", err);
      setComplaint(null);
    } finally {
      setLoading(false);
    }
  };

  const resolveComplaint = async (id: string) => {
    try {
      setResolving(true);

      await fetch(`${API_BASE_URL}/api/complaints/${id}/resolve`, {
        method: "POST",
        headers: {
          ...getAdminHeaders(adminEmail, adminPassword),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ remarks: remarks }),
      });

      await loadDetails();

      Alert.alert("Success", "Complaint has been marked as resolved", [
        { text: "OK" },
      ]);
    } catch (err) {
      console.error("Resolve error:", err);
      Alert.alert("Error", "Failed to resolve complaint. Please try again.", [
        { text: "OK" },
      ]);
    } finally {
      setResolving(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "resolved":
        return "#10b981";
      case "pending":
        return "#f59e0b";
      case "in progress":
        return "#3b82f6";
      default:
        return "#6b7280";
    }
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Loading details...</Text>
      </View>
    );
  }

  if (!complaint) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorText}>Complaint not found</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.wrapper}>
        <LinearGradient
          colors={["#1f2937", "#111827", "#000000"]}
          style={styles.header}
        >
          <TouchableOpacity
            style={styles.backButtonHeader}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonHeaderText}>← Back</Text>
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.adminBadge}>ADMIN VIEW</Text>
            <Text style={styles.headerTitle}>Complaint Details</Text>
            <Text style={styles.headerSubtitle}>ID #{complaint?.id}</Text>
          </View>
        </LinearGradient>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.mainCard}>
            <View style={styles.departmentContainer}>
              <View style={styles.departmentBadge}>
                <Text style={styles.departmentIcon}>🏢</Text>
                <Text style={styles.departmentText}>
                  {complaint.department}
                </Text>
              </View>
            </View>

            <View style={styles.statusRow}>
              <View style={styles.statusContainer}>
                <Text style={styles.sectionLabel}>Status</Text>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor: `${getStatusColor(complaint.status)}20`,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.statusDot,
                      { backgroundColor: getStatusColor(complaint.status) },
                    ]}
                  />
                  <Text
                    style={[
                      styles.statusText,
                      { color: getStatusColor(complaint.status) },
                    ]}
                  >
                    {complaint.status}
                  </Text>
                </View>
              </View>

              {complaint.priority && (
                <View style={styles.priorityContainer}>
                  <Text style={styles.sectionLabel}>Priority</Text>
                  <View
                    style={[
                      styles.priorityBadge,
                      {
                        backgroundColor: `${getPriorityColor(
                          complaint.priority,
                        )}20`,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.priorityText,
                        { color: getPriorityColor(complaint.priority) },
                      ]}
                    >
                      {complaint.priority}
                    </Text>
                  </View>
                </View>
              )}
            </View>

            <View style={styles.divider} />

            {/* 🟢 ADDED: Submitter Info Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionIcon}>👤</Text>
                <Text style={styles.sectionTitle}>Submitted By</Text>
              </View>
              <View style={styles.infoBox}>
                <Text style={styles.infoText}>
                  👨‍💼 {complaint.submitter_name || "Anonymous User"}
                </Text>
                {complaint.submitter_email && (
                  <Text style={styles.infoTextSecondary}>
                    📧 {complaint.submitter_email}
                  </Text>
                )}
              </View>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionIcon}>📝</Text>
                <Text style={styles.sectionTitle}>Complaint Description</Text>
              </View>
              <View style={styles.detailsBox}>
                <Text style={styles.detailsText}>
                  {complaint?.complain_detail}
                </Text>
              </View>
            </View>

            {/* 🟢 NEW: Remarks & Action Section (Only for Pending) */}
            {complaint?.status !== "Resolved" && (
              <View style={styles.adminActionsCard}>
                <Text style={styles.adminActionsTitle}>Resolution Action</Text>

                <Text style={styles.sectionLabel}>Admin Remarks</Text>
                <TextInput
                  style={styles.remarksInput}
                  placeholder="Describe how the issue was fixed..."
                  placeholderTextColor="#94a3b8"
                  multiline
                  numberOfLines={4}
                  value={remarks}
                  onChangeText={setRemarks}
                />

                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    resolving && styles.actionButtonDisabled,
                  ]}
                  onPress={() => resolveComplaint(complaint!.id)} // 🟢 This button now sends the remarks
                  disabled={resolving}
                >
                  {resolving ? (
                    <ActivityIndicator color="#16a34a" size="small" />
                  ) : (
                    <Text style={styles.actionButtonText}>
                      ✓ Submit & Mark Resolved
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {complaint.complain_location && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionIcon}>📍</Text>
                  <Text style={styles.sectionTitle}>Location</Text>
                </View>
                <View style={styles.infoBox}>
                  <Text style={styles.infoText}>
                    {complaint.complain_location}
                  </Text>
                </View>
              </View>
            )}

            {complaint.to_whom && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionIcon}>👷</Text>
                  <Text style={styles.sectionTitle}>Assigned To</Text>
                </View>
                <View style={styles.infoBox}>
                  <Text style={styles.infoText}>{complaint.to_whom}</Text>
                </View>
              </View>
            )}

            {complaint.assets && complaint.assets.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionIcon}>🔧</Text>
                  <Text style={styles.sectionTitle}>Related Gadgets</Text>
                </View>
                <View style={styles.assetsContainer}>
                  {complaint.assets.map((asset, index) => (
                    <View key={index} style={styles.assetChip}>
                      <Text style={styles.assetChipText}>{asset}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            <View style={styles.divider} />

            <View style={styles.timestampContainer}>
              <Text style={styles.timestampIcon}>🕐</Text>
              <View style={styles.timestampTextContainer}>
                <Text style={styles.timestampLabel}>Submitted on</Text>
                <Text style={styles.timestampText}>
                  {formatDate(complaint.created_at)}
                </Text>
              </View>
            </View>
          </View>

          {complaint.status !== "Resolved" && (
            <View style={styles.adminActionsCard}>
              <Text style={styles.adminActionsTitle}>Admin Actions</Text>
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  resolving && styles.actionButtonDisabled,
                ]}
                onPress={() => resolveComplaint(complaint.id)}
                activeOpacity={0.7}
                disabled={resolving}
              >
                {resolving ? (
                  <View style={styles.actionButtonLoading}>
                    <ActivityIndicator color="#16a34a" size="small" />
                    <Text style={styles.actionButtonText}>Resolving...</Text>
                  </View>
                ) : (
                  <Text style={styles.actionButtonText}>
                    ✓ Mark as Resolved
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {complaint.status === "Resolved" && (
            <View style={styles.resolvedBanner}>
              <Text style={styles.resolvedIcon}>✅</Text>
              <Text style={styles.resolvedText}>
                This complaint has been resolved
              </Text>
            </View>
          )}

          {complaint?.status === "Resolved" && (
            <View style={styles.resolvedInfoCard}>
              <Text style={styles.resolvedTitle}>✅ Resolved</Text>
              <View style={styles.remarksBox}>
                <Text style={styles.remarksLabel}>Admin Remarks:</Text>
                <Text style={styles.remarksText}>
                  {complaint.admin_remarks || "No remarks provided."}
                </Text>
              </View>
            </View>
          )}
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
  adminActionsCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 20,
    marginTop: 10,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  adminActionsTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1e293b",
    marginBottom: 16,
  },
  remarksInput: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 12,
    padding: 15,
    fontSize: 15,
    color: "#334155",
    textAlignVertical: "top",
    minHeight: 120,
    marginBottom: 20,
  },
  actionButton: {
    backgroundColor: "#dcfce7",
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#10b981",
    alignItems: "center",
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#16a34a",
  },
  resolvedInfoCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 20,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#10b981",
  },
  resolvedTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#16a34a",
    marginBottom: 10,
  },
  remarksBox: {
    backgroundColor: "#f0fdf4",
    padding: 15,
    borderRadius: 12,
  },
  remarksLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#15803d",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  remarksText: {
    fontSize: 15,
    color: "#166534",
    lineHeight: 22,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  backButtonHeader: {
    marginBottom: 12,
  },
  backButtonHeaderText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  headerContent: {
    alignItems: "center",
  },
  adminBadge: {
    fontSize: 12,
    fontWeight: "700",
    color: "#fbbf24",
    marginBottom: 8,
    letterSpacing: 1,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#ffffff",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#9ca3af",
    fontWeight: "500",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  mainCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  departmentContainer: {
    marginBottom: 20,
  },
  departmentBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eff6ff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  departmentIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  departmentText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2563eb",
  },
  statusRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  statusContainer: {
    flex: 1,
  },
  priorityContainer: {
    flex: 1,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748b",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "700",
  },
  priorityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  priorityText: {
    fontSize: 14,
    fontWeight: "700",
  },
  divider: {
    height: 1,
    backgroundColor: "#e2e8f0",
    marginVertical: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e293b",
  },
  detailsBox: {
    backgroundColor: "#f8fafc",
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#3b82f6",
  },
  detailsText: {
    fontSize: 15,
    color: "#334155",
    lineHeight: 24,
  },
  infoBox: {
    backgroundColor: "#f8fafc",
    padding: 14,
    borderRadius: 10,
    gap: 6,
  },
  infoText: {
    fontSize: 15,
    color: "#475569",
    fontWeight: "500",
  },
  infoTextSecondary: {
    fontSize: 14,
    color: "#64748b",
  },
  assetsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  assetChip: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  assetChipText: {
    fontSize: 13,
    color: "#475569",
    fontWeight: "500",
  },
  timestampContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    padding: 14,
    borderRadius: 12,
  },
  timestampIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  timestampTextContainer: {
    flex: 1,
  },
  timestampLabel: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 2,
    fontWeight: "500",
  },
  timestampText: {
    fontSize: 14,
    color: "#334155",
    fontWeight: "600",
  },
  actionButtonDisabled: {
    opacity: 0.6,
  },
  actionButtonLoading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  resolvedBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#dcfce7",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#10b981",
    gap: 10,
  },
  resolvedIcon: {
    fontSize: 24,
  },
  resolvedText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#16a34a",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#f8fafc",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#64748b",
    fontWeight: "500",
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 18,
    color: "#dc2626",
    fontWeight: "600",
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  backButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});
