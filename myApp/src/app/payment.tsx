import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert, Image, ActivityIndicator } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import api from "../utils/api";
import { downloadQrImage } from "../utils/qr";

type Expense = { _id: string; description: string; amount: number; share: number; qrImage: string; paidBy: { _id: string; name: string } };

export default function Payment() {
  const { friendId, friendName } = useLocalSearchParams<{ friendId: string; friendName: string }>();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    api.get("/expenses").then((res) => {
      setExpenses((res.data.expenses || []).filter((e: Expense) => e.paidBy?._id === friendId && e.settlementStatus !== "paid"));
    }).catch(() => Alert.alert("Error", "Could not load payment details")).finally(() => setLoading(false));
  }, [friendId]);

  const qr = expenses[0]?.qrImage;
  const total = expenses.reduce((sum, e) => sum + e.share, 0);

  const requestPayment = async () => {
    setRequesting(true);
    try { await api.post("/expenses/request-payment", { friendId }); Alert.alert("Payment sent", "Your friend can now approve the payment.", [{ text: "OK", onPress: () => router.replace("/") }]); }
    catch (err: any) { Alert.alert("Failed", err.response?.data?.error || "Could not send payment request"); }
    finally { setRequesting(false); }
  };

  const saveQr = async () => {
    try { await downloadQrImage(qr); Alert.alert("Saved", "QR image saved to your photo library"); }
    catch (err: any) { Alert.alert("Could not save", err.message || "Please allow photo access"); }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#6d5dfc" /></View>;

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()}><Text style={styles.back}>‹ Back</Text></TouchableOpacity>
      <Text style={styles.title}>Pay {friendName}</Text>
      <Text style={styles.amount}>₹{total.toFixed(0)}</Text>
      <Text style={styles.subtitle}>Scan the QR to pay, then tap I Paid.</Text>
      {qr ? <Image source={{ uri: qr }} style={styles.qr} /> : <Text style={styles.noQr}>QR is not available for this expense.</Text>}
      {qr && <TouchableOpacity style={styles.download} onPress={saveQr}><Text style={styles.downloadText}>Download QR</Text></TouchableOpacity>}
      <TouchableOpacity style={[styles.paidButton, (!qr || requesting) && { opacity: 0.5 }]} disabled={!qr || requesting} onPress={requestPayment}><Text style={styles.paidText}>{requesting ? "Sending..." : "I Paid"}</Text></TouchableOpacity>
      <Text style={styles.note}>Your balance is removed only after {friendName} approves your payment.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#faf9ff", paddingHorizontal: 24, paddingTop: 58, alignItems: "center" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  back: { alignSelf: "flex-start", color: "#6d5dfc", fontSize: 16, fontWeight: "700" },
  title: { fontSize: 27, fontWeight: "800", marginTop: 20, color: "#222" },
  amount: { fontSize: 32, fontWeight: "800", color: "#6d5dfc", marginTop: 8 },
  subtitle: { color: "#777", textAlign: "center", marginTop: 8 },
  qr: { width: 270, height: 270, marginTop: 25, backgroundColor: "#fff", borderRadius: 14 },
  noQr: { marginTop: 60, color: "#999" },
  download: { marginTop: 16, borderWidth: 1, borderColor: "#d7d2f5", backgroundColor: "#fff", paddingVertical: 12, paddingHorizontal: 25, borderRadius: 11 },
  downloadText: { color: "#5d4ee8", fontWeight: "700" },
  paidButton: { width: "100%", backgroundColor: "#6d5dfc", padding: 16, borderRadius: 12, alignItems: "center", marginTop: 20 },
  paidText: { color: "#fff", fontWeight: "800", fontSize: 16 },
  note: { color: "#999", textAlign: "center", marginTop: 14, fontSize: 12, lineHeight: 18 },
});
