import { Text, TouchableOpacity, View, StyleSheet } from "react-native";
import { router, usePathname } from "expo-router";

const tabs = [
  { path: "/", label: "Home", icon: "⌂" },
  { path: "/approvals", label: "Approvals", icon: "✓" },
  { path: "/history", label: "History", icon: "◷" },
];

export default function BottomNav() {
  const pathname = usePathname();
  return (
    <View style={styles.bar}>
      {tabs.map((tab) => {
        const active = pathname === tab.path;
        return (
          <TouchableOpacity key={tab.path} style={styles.item} onPress={() => router.replace(tab.path as any)}>
            <Text style={[styles.icon, active && styles.active]}>{tab.icon}</Text>
            <Text style={[styles.label, active && styles.active]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { position: "absolute", left: 0, right: 0, bottom: 0, height: 72, backgroundColor: "#fff", borderTopWidth: 1, borderTopColor: "#eee", flexDirection: "row", justifyContent: "space-around", paddingTop: 8 },
  item: { alignItems: "center", width: "33%" },
  icon: { fontSize: 22, color: "#999", marginBottom: 2 },
  label: { fontSize: 12, color: "#999", fontWeight: "600" },
  active: { color: "#6d5dfc" },
});
