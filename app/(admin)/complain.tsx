import { getAdminHeaders } from "@/constants/adminAuth";
import { API_BASE_URL } from "@/constants/Config";
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store"; // 🟢 Added for clearing session
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert, // 🟢 Added for confirmation
    FlatList,
    Image,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const LOGO_IMG = require("@/assets/images/icon.png")

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

  useEffect(() => {
    loadComplaints();
  }, []);

  // 🟢 NEW: Sign Out Function
  const handleSignOut = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Log Out", 
          style: "destructive",
          onPress: async () => {
            try {
              // Clear the stored admin email to stop notifications
              await SecureStore.deleteItemAsync("adminEmail");
              // Go back to login
              router.replace("/(auth)/login");
            } catch (err) {
              router.replace("/(auth)/login");
            }
          } 
        }
      ]
    );
  };

  const loadComplaints = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/complaints`, {
        headers: getAdminHeaders(adminEmail, adminPassword),
      });

      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }

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
    loadComplaints();
  };

  const resolveComplaint = async (id: string) => {
    try {
      await fetch(`${API_BASE_URL}/api/complaints/${id}/resolve`, {
        method: "POST",
        headers: getAdminHeaders(adminEmail, adminPassword),
      });
      loadComplaints();
    } catch (err) {
      console.error("Resolve error:", err);
    }
  };

  const getStatusColor = (status: string) => {
    return status === "Resolved" ? "#10b981" : "#f59e0b";
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
      {/* Header with Stats & Sign Out */}
      <LinearGradient
        colors={['#3b82f6', '#2563eb', '#1d4ed8']}
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
            {/* 🟢 NEW: Sign Out Button */}
            <TouchableOpacity 
                style={styles.signOutButton} 
                onPress={handleSignOut}
                activeOpacity={0.7}
            >
                <Text style={styles.signOutText}>Sign Out 🚪</Text>
            </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{complaints.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {complaints.filter(c => c.status === 'Pending').length}
            </Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {complaints.filter(c => c.status === 'Resolved').length}
            </Text>
            <Text style={styles.statLabel}>Resolved</Text>
          </View>
        </View>
      </LinearGradient>

      {complaints.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyTitle}>No Complaints Found</Text>
          <Text style={styles.emptySubtitle}>
            Complaints will appear here once employees submit them.
          </Text>
        </View>
      ) : (
        <FlatList
          data={complaints}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
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
                      { backgroundColor: `${getPriorityColor(item.priority)}20` }
                    ]}
                  >
                    <Text 
                      style={[
                        styles.priorityText,
                        { color: getPriorityColor(item.priority) }
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
                    { backgroundColor: `${getStatusColor(item.status)}20` }
                  ]}
                >
                  <View 
                    style={[
                      styles.statusDot,
                      { backgroundColor: getStatusColor(item.status) }
                    ]} 
                  />
                  <Text 
                    style={[
                      styles.statusText,
                      { color: getStatusColor(item.status) }
                    ]}
                  >
                    {item.status}
                  </Text>
                </View>

                <View style={styles.buttonGroup}>
                  <TouchableOpacity
                    style={styles.viewButton}
                    onPress={() =>
                      router.push({
                        pathname: "/(admin)/complain-details",
                        params: { id: item.id },
                      })
                    }
                  >
                    <Text style={styles.viewButtonText}>View →</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#1d4ed8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  topHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
    // 🟢 Added: Ensures a minimum gap between items
  },
  headerTitle: { 
    fontSize: 22, 
    fontWeight: '800', 
    color: '#ffffff',
    // 🟢 Added: Allows the title to shrink if needed so it doesn't overlap
    flexShrink: 1, 
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10, // Space between logo and text
    flexShrink: 1,
  },
  companyLogo: {
    width: 32,
    height: 32,
    borderRadius: 6,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#dbeafe',
    fontWeight: '600',
  },
  list: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  signOutButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  signOutText: { color: '#ffffff', fontWeight: '700', fontSize: 13 },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  departmentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  departmentIcon: {
    fontSize: 14,
  },
  departmentText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2563eb',
  },
  priorityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '700',
  },
  detail: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 22,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaIcon: {
    fontSize: 12,
  },
  metaText: {
    fontSize: 13,
    color: '#64748b',
  },
  dateText: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 12,
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginBottom: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '700',
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2563eb',
  },
  viewButtonIcon: {
    fontSize: 16,
    color: '#2563eb',
    fontWeight: 'bold',
  },
  resolveButton: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#10b981',
  },
  resolveButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#16a34a',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f8fafc',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
});