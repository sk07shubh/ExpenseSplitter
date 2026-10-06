import { useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
} from "react-native";
import { useFocusEffect } from "expo-router";
import api from "../utils/api";
import BottomNav from "../components/BottomNav";

type Expense = {
  _id: string;
  description: string;
  amount: number;
  share: number;
  paidBy: {
    _id: string;
    name: string;
  };
  isPayer: boolean;
  historyStatus: string;
  paidParticipants: number;
  participantCount: number;
  expenseDate?: string;
  createdAt: string;
};

export default function History() {
  const [items, setItems] = useState<Expense[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    paid: 0,
    owed: 0,
    settled: 0,
  });

  const load = async () => {
    try {
      const res = await api.get("/expenses");
      const list = res.data.expenses || [];

      setItems(list);

      setStats({
        total: list.length,
        paid: list
          .filter((e: Expense) => e.isPayer)
          .reduce((s: number, e: Expense) => s + e.amount, 0),
        owed: list
          .filter(
            (e: Expense) =>
              !e.isPayer && e.historyStatus !== "paid"
          )
          .reduce((s: number, e: Expense) => s + e.share, 0),
        settled: list.filter(
          (e: Expense) =>
            e.historyStatus === "settled" ||
            e.historyStatus === "paid"
        ).length,
      });
    } catch {}
  };

  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Expense history</Text>

      <Text style={styles.subtitle}>
        A simple record of what happened with every shared bill.
      </Text>

      <View style={styles.stats}>
        <View>
          <Text style={styles.statValue}>{stats.total}</Text>
          <Text style={styles.statLabel}>Bills</Text>
        </View>

        <View>
          <Text style={styles.statValue}>
            ₹{stats.paid.toFixed(0)}
          </Text>
          <Text style={styles.statLabel}>Paid by you</Text>
        </View>

        <View>
          <Text style={styles.statValue}>
            ₹{stats.owed.toFixed(0)}
          </Text>
          <Text style={styles.statLabel}>To pay</Text>
        </View>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 100,
        }}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={load}
          />
        }
        ListEmptyComponent={
          <Text style={styles.empty}>
            Your expense history will appear here.
          </Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>

            {/* Expense date */}
            <View style={styles.dateBox}>
  {item.expenseDate ? (
    <>
      <Text style={styles.dateDay}>
        {new Date(item.expenseDate).toLocaleDateString("en-IN", {
          day: "2-digit",
        })}
      </Text>

      <Text style={styles.dateMonth}>
        {new Date(item.expenseDate)
          .toLocaleDateString("en-IN", {
            month: "short",
          })
          .toUpperCase()}
      </Text>

      <Text style={styles.dateYear}>
        {new Date(item.expenseDate).getFullYear()}
      </Text>
    </>
  ) : (
    <Text style={styles.oldDate}>—</Text>
  )}
</View>

            {/* Expense information */}
            <View style={styles.content}>
              <Text style={styles.description}>
                {item.description}
              </Text>

              <Text style={styles.meta}>
                {item.isPayer
                  ? `You paid ₹${item.amount.toFixed(0)}`
                  : `Paid by ${item.paidBy.name} · your share ₹${item.share.toFixed(0)}`}
              </Text>

              <Text style={styles.meta}>
                {item.paidParticipants}/
                {item.participantCount - 1} friends settled
              </Text>
            </View>

            {/* Status */}
            <View style={styles.right}>
              <Text
                style={[
                  styles.status,
                  item.historyStatus === "settled" ||
                  item.historyStatus === "paid"
                    ? styles.green
                    : styles.orange,
                ]}
              >
                {item.historyStatus}
              </Text>
            </View>

          </View>
        )}
      />

      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#faf9ff",
    paddingTop: 58,
  },

  title: {
    fontSize: 27,
    fontWeight: "800",
    paddingHorizontal: 20,
    color: "#222",
  },

  subtitle: {
    color: "#777",
    paddingHorizontal: 20,
    marginTop: 5,
  },

  stats: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    margin: 16,
    padding: 16,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#eeeaf8",
  },

  statValue: {
    fontSize: 18,
    fontWeight: "800",
    color: "#6d5dfc",
  },

  statLabel: {
    color: "#888",
    fontSize: 11,
    marginTop: 3,
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#eeeaf8",
  },

  dateBox: {
    width: 52,
    alignItems: "center",
    justifyContent: "center",
    borderRightWidth: 1,
    borderRightColor: "#eeeaf8",
    marginRight: 12,
    paddingRight: 10,
  },

  dateDay: {
    fontSize: 21,
    fontWeight: "800",
    color: "#6d5dfc",
  },

  dateMonth: {
    fontSize: 11,
    fontWeight: "800",
    color: "#777",
    marginTop: 1,
  },

  dateYear: {
    fontSize: 10,
    color: "#aaa",
    marginTop: 1,
  },
  oldDate: {
  color: "#aaa",
  fontSize: 18,
  fontWeight: "700",
},

  content: {
    flex: 1,
  },

  description: {
    fontWeight: "800",
    fontSize: 15,
  },

  meta: {
    color: "#777",
    marginTop: 4,
    fontSize: 12,
  },

  right: {
    alignItems: "flex-end",
    marginLeft: 8,
  },

  status: {
    fontSize: 11,
    fontWeight: "800",
    textTransform: "capitalize",
  },

  green: {
    color: "#159447",
  },

  orange: {
    color: "#c47a10",
  },

  empty: {
    textAlign: "center",
    marginTop: 60,
    color: "#999",
  },
});

