import { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Profile() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    AsyncStorage.multiGet([
      "userName",
      "userUsername",
      "userEmail",
    ]).then((values) => {
      setName(values[0][1] || "");
      setUsername(values[1][1] || "");
      setEmail(values[2][1] || "");
    });
  }, []);

  const logout = async () => {
    await AsyncStorage.multiRemove([
      "token",
      "userId",
      "userName",
      "userUsername",
      "userEmail",
    ]);

    router.replace("/login");
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.back}>‹ Back</Text>
      </TouchableOpacity>

      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {name.charAt(0).toUpperCase() || "U"}
        </Text>
      </View>

      <Text style={styles.name}>{name}</Text>
      <Text style={styles.username}>@{username}</Text>
      <Text style={styles.email}>{email}</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Name</Text>
        <Text style={styles.value}>{name}</Text>

        <Text style={[styles.label, { marginTop: 18 }]}>
          Username
        </Text>
        <Text style={styles.value}>@{username}</Text>

        <Text style={[styles.label, { marginTop: 18 }]}>
          Email
        </Text>
        <Text style={styles.value}>{email}</Text>
      </View>

      <TouchableOpacity
        style={styles.logout}
        onPress={() =>
          Alert.alert(
            "Log out",
            "Are you sure you want to log out?",
            [
              {
                text: "Cancel",
                style: "cancel",
              },
              {
                text: "Log out",
                style: "destructive",
                onPress: logout,
              },
            ]
          )
        }
      >
        <Text style={styles.logoutText}>Log out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#faf9ff",
    paddingHorizontal: 24,
    paddingTop: 58,
  },
  back: {
    color: "#6d5dfc",
    fontSize: 16,
    fontWeight: "700",
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: "#eeeaff",
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 35,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "800",
    color: "#6d5dfc",
  },
  name: {
    textAlign: "center",
    fontSize: 25,
    fontWeight: "800",
    marginTop: 12,
  },
  username: {
    textAlign: "center",
    color: "#6d5dfc",
    fontWeight: "600",
    marginTop: 4,
  },
  email: {
    textAlign: "center",
    color: "#888",
    marginTop: 4,
  },
  card: {
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 15,
    marginTop: 30,
    borderWidth: 1,
    borderColor: "#eeeaf8",
  },
  label: {
    fontSize: 12,
    color: "#999",
  },
  value: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 4,
  },
  logout: {
    marginTop: 22,
    borderWidth: 1,
    borderColor: "#f0caca",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  logoutText: {
    color: "#d44b4b",
    fontWeight: "800",
  },
});