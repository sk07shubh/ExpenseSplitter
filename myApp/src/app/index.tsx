import { useCallback, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl, ActivityIndicator } from "react-native";
import { router, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../utils/api";
import BottomNav from "../components/BottomNav";

type Friend = { _id: string; name: string; email: string; youOwe: number; theyOwe: number; expenseIds: string[]; qrImage?: string | null; hasRequestedPayment: boolean };

type Data = { friends: Friend[]; totalOutstanding: number };

export default function Home() {
  const [data, setData] = useState<Data>({ friends: [], totalOutstanding: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userName, setUserName] = useState("");

  const load = async () => {
    try {
      const res = await api.get("/expenses");
      setData({ friends: res.data.friends || [], totalOutstanding: res.data.totalOutstanding || 0 });
    } catch (err) { console.log("Failed to load expenses", err); }
  };

  const checkAuthAndLoad = async () => {
    const token = await AsyncStorage.getItem("token");
    if (!token) { router.replace("/login"); return; }
    setUserName((await AsyncStorage.getItem("userName")) || "");
    setLoading(true); await load(); setLoading(false);
  };

  useFocusEffect(useCallback(() => { checkAuthAndLoad(); }, []));

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  if (loading) return <View style={styles.centered}><ActivityIndicator size="large" color="#6d5dfc" /></View>;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.greeting}>Hi, {userName}</Text>
          <Text style={styles.balance}>Remaining to pay</Text>
          <Text style={styles.total}>₹{data.totalOutstanding.toFixed(0)}</Text>
        </View>
        <TouchableOpacity
  style={styles.profileButton}
  onPress={() => router.push("/profile")}
>
  <View style={styles.profileHead} />
  <View style={styles.profileBody} />
</TouchableOpacity>
      </View>

      <FlatList
        data={data.friends}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ padding: 16, paddingBottom: 150 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListHeaderComponent={<Text style={styles.sectionTitle}>Friends</Text>}
        ListEmptyComponent={<Text style={styles.empty}>No shared bills yet. Add your first expense!</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.avatar}><Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.name}</Text>
              {item.youOwe > 0 && <Text style={styles.owe}>You owe ₹{item.youOwe.toFixed(0)}</Text>}
              {item.theyOwe > 0 && <Text style={styles.owed}>{item.name} owes you ₹{item.theyOwe.toFixed(0)}</Text>}
              {!item.youOwe && !item.theyOwe && <Text style={styles.settled}>Settled</Text>}
            </View>
            {item.youOwe > 0 && <TouchableOpacity style={styles.payButton} onPress={() => router.push({ pathname: "/payment", params: { friendId: item._id, friendName: item.name } })}><Text style={styles.payText}>{item.hasRequestedPayment ? "Requested" : "Pay"}</Text></TouchableOpacity>}
          </View>
        )}
      />

      <TouchableOpacity style={styles.fab} onPress={() => router.push("/add-expense")}><Text style={styles.fabText}>+</Text></TouchableOpacity>
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#faf9ff" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingTop: 58, paddingBottom: 20, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#eee" },
  greeting: { fontSize: 25, fontWeight: "800", color: "#222" },
  balance: { fontSize: 13, color: "#777", marginTop: 10 },
  total: { fontSize: 28, fontWeight: "800", color: "#6d5dfc", marginTop: 2 },
  profileButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#eeeaff", justifyContent: "center", alignItems: "center" },
  profileHead: {
  width: 10,
  height: 10,
  borderRadius: 5,
  backgroundColor: "#6d5dfc",
  marginBottom: 3,
},
profileBody: {
  width: 20,
  height: 10,
  borderTopLeftRadius: 10,
  borderTopRightRadius: 10,
  backgroundColor: "#6d5dfc",
},
  sectionTitle: { fontSize: 19, fontWeight: "800", marginBottom: 4, color: "#222" },
  card: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", marginTop: 12, padding: 15, borderRadius: 16, borderWidth: 1, borderColor: "#eeeaf8" },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#eeeaff", justifyContent: "center", alignItems: "center", marginRight: 12 },
  avatarText: { color: "#6d5dfc", fontWeight: "800", fontSize: 17 },
  name: { fontSize: 16, fontWeight: "700" },
  owe: { color: "#dc4c4c", marginTop: 4, fontWeight: "600" },
  owed: { color: "#159447", marginTop: 4, fontWeight: "600" },
  settled: { color: "#888", marginTop: 4 },
  payButton: { backgroundColor: "#6d5dfc", paddingHorizontal: 15, paddingVertical: 10, borderRadius: 10 },
  payText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  empty: { textAlign: "center", marginTop: 60, color: "#999", fontSize: 15 },
  fab: { position: "absolute", bottom: 88, right: 22, backgroundColor: "#6d5dfc", width: 58, height: 58, borderRadius: 29, justifyContent: "center", alignItems: "center", elevation: 5 },
  fabText: { color: "#fff", fontSize: 30, marginTop: -2 },
});
