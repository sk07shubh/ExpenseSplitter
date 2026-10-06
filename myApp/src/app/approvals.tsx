import { useCallback, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl, Alert } from "react-native";
import { router, useFocusEffect } from "expo-router";
import api from "../utils/api";
import BottomNav from "../components/BottomNav";

type Request = { expenseId: string; description: string; amount: number; from: { _id: string; name: string; email: string }; requestedAt: string; createdAt: string };

export default function Approvals() {
  const [items, setItems] = useState<Request[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const load = async () => { try { const res = await api.get("/expenses"); setItems(res.data.paymentRequests || []); } catch {} };
  useFocusEffect(useCallback(() => { load(); }, []));
  const approve = async (item: Request) => { try { await api.post(`/expenses/${item.expenseId}/approve-payment`, { userId: item.from._id }); Alert.alert("Approved", "The payment is now settled."); load(); } catch (err: any) { Alert.alert("Failed", err.response?.data?.error || "Could not approve payment"); } };

  return <View style={styles.container}>
    <Text style={styles.title}>Payment approvals</Text>
    <Text style={styles.subtitle}>Confirm payments after you receive them.</Text>
    <FlatList data={items} keyExtractor={(item, i) => `${item.expenseId}-${item.from._id}-${i}`} contentContainerStyle={{ padding: 16, paddingBottom: 100 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} />} ListEmptyComponent={<Text style={styles.empty}>No payment requests right now.</Text>} renderItem={({ item }) => <View style={styles.card}><View style={styles.avatar}><Text style={styles.avatarText}>{item.from.name.charAt(0).toUpperCase()}</Text></View><View style={{ flex: 1 }}><Text style={styles.name}>{item.from.name}</Text><Text style={styles.description}>{item.description}</Text><Text style={styles.amount}>₹{item.amount.toFixed(0)}</Text></View><TouchableOpacity style={styles.approve} onPress={() => approve(item)}><Text style={styles.approveText}>Approve</Text></TouchableOpacity></View>} />
    <BottomNav />
  </View>;
}
const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: "#faf9ff", paddingTop: 58 }, title: { fontSize: 27, fontWeight: "800", paddingHorizontal: 20, color: "#222" }, subtitle: { color: "#777", paddingHorizontal: 20, marginTop: 5 }, card: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 15, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: "#eeeaf8" }, avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: "#eeeaff", justifyContent: "center", alignItems: "center", marginRight: 12 }, avatarText: { color: "#6d5dfc", fontWeight: "800" }, name: { fontWeight: "800", fontSize: 15 }, description: { color: "#777", marginTop: 3 }, amount: { color: "#6d5dfc", fontWeight: "800", marginTop: 3 }, approve: { backgroundColor: "#6d5dfc", paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10 }, approveText: { color: "#fff", fontWeight: "800" }, empty: { textAlign: "center", marginTop: 70, color: "#999" } });
