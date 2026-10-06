import { useState } from "react";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../utils/api";
import { pickQrImage } from "../utils/qr";

type FoundUser = {
  _id: string;
  name: string;
  username: string;
};

export default function AddExpense() {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");

  const [expenseDate, setExpenseDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [friendUsername, setFriendUsername] = useState("");
  const [friend, setFriend] = useState<FoundUser | null>(null);
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSearch = async () => {
    if (!friendUsername.trim()) return;

    setSearching(true);
    setFriend(null);

    try {
      const res = await api.get("/users/search", {
        params: {
          username: friendUsername.trim().toLowerCase(),
        },
      });

      setFriend(res.data);
    } catch (err: any) {
      Alert.alert(
        "Not found",
        "No user with that username. They need to sign up first."
      );
    } finally {
      setSearching(false);
    }
  };

  const handlePickQr = async () => {
    try {
      const image = await pickQrImage();

      if (image) {
        setQrImage(image);
      }
    } catch (err: any) {
      Alert.alert(
        "QR upload failed",
        err.message || "Could not select the QR image"
      );
    }
  };

  const handleSave = async () => {
    if (!description.trim() || !amount || !friend || !qrImage) {
      Alert.alert(
        "Missing info",
        "Add a description, amount, friend, and the QR code for this expense"
      );
      return;
    }

    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      Alert.alert("Invalid amount", "Enter a valid amount");
      return;
    }

    setSaving(true);

    try {
      const selfId = await AsyncStorage.getItem("userId");

      await api.post("/expenses", {
        description: description.trim(),
        amount: numericAmount,
        expenseDate: expenseDate.toISOString(),
        participantIds: [selfId, friend._id],
        qrImage,
      });

      router.replace("/");
    } catch (err: any) {
      Alert.alert(
        "Failed",
        err.response?.data?.error || "Could not add expense"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Add expense</Text>

      <Text style={styles.subtitle}>
        The QR you upload belongs only to this expense.
      </Text>

      <TextInput
        style={styles.input}
        placeholder="What was it for?"
        placeholderTextColor="#999"
        value={description}
        onChangeText={setDescription}
      />

      <TextInput
        style={styles.input}
        placeholder="Amount (₹)"
        placeholderTextColor="#999"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
      />

      <Text style={styles.label}>Expense date</Text>

      <TouchableOpacity
        style={styles.dateButton}
        onPress={() => setShowDatePicker(true)}
      >
        <Text style={styles.dateButtonText}>
          📅{" "}
          {expenseDate.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={expenseDate}
          mode="date"
          display="default"
          maximumDate={new Date()}
          onValueChange={(event, selectedDate) => {
  setExpenseDate(selectedDate);
}}
onDismiss={() => {
  setShowDatePicker(false);
}}
        />
      )}

      <Text style={styles.label}>Split with</Text>

      <View style={styles.searchRow}>
        <TextInput
          style={[styles.input, { flex: 1, marginBottom: 0 }]}
          placeholder="friend_username"
          placeholderTextColor="#999"
          autoCapitalize="none"
          value={friendUsername}
          onChangeText={setFriendUsername}
        />

        <TouchableOpacity
          style={styles.searchButton}
          onPress={handleSearch}
          disabled={searching}
        >
          <Text style={styles.searchButtonText}>
            {searching ? "..." : "Find"}
          </Text>
        </TouchableOpacity>
      </View>

      {friend && (
        <View style={styles.friendFound}>
          <Text style={styles.friendFoundText}>
            ✓ {friend.name} (@{friend.username})
          </Text>
        </View>
      )}

      <Text style={styles.label}>Payment QR</Text>

      <TouchableOpacity style={styles.qrButton} onPress={handlePickQr}>
        <Text style={styles.qrButtonText}>
          {qrImage ? "Change QR image" : "Upload QR image"}
        </Text>
      </TouchableOpacity>

      {qrImage && (
        <Image source={{ uri: qrImage }} style={styles.qrPreview} />
      )}

      <TouchableOpacity
        style={styles.button}
        onPress={handleSave}
        disabled={saving}
      >
        <Text style={styles.buttonText}>
          {saving ? "Saving..." : "Add Expense"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.cancel}>Cancel</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
    backgroundColor: "#faf9ff",
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 6,
  },

  subtitle: {
    color: "#777",
    marginBottom: 24,
  },

  input: {
    borderWidth: 1,
    borderColor: "#e3e0f0",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    fontSize: 16,
  },

  label: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
    marginTop: 8,
    fontWeight: "600",
  },

  dateButton: {
    borderWidth: 1,
    borderColor: "#e3e0f0",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
  },

  dateButtonText: {
    fontSize: 16,
    color: "#222",
  },

  searchRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },

  searchButton: {
    backgroundColor: "#eeeaff",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
  },

  searchButtonText: {
    color: "#5d4ee8",
    fontWeight: "700",
  },

  friendFound: {
    backgroundColor: "#eefbf3",
    padding: 12,
    borderRadius: 10,
    marginTop: 12,
  },

  friendFoundText: {
    color: "#159447",
    fontWeight: "600",
  },

  qrButton: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#9a8ff7",
    backgroundColor: "#f3f1ff",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },

  qrButtonText: {
    color: "#5d4ee8",
    fontWeight: "700",
  },

  qrPreview: {
    width: 180,
    height: 180,
    alignSelf: "center",
    marginTop: 16,
    borderRadius: 10,
    backgroundColor: "#fff",
  },

  button: {
    backgroundColor: "#6d5dfc",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 28,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },

  cancel: {
    textAlign: "center",
    color: "#999",
    marginTop: 18,
  },
});