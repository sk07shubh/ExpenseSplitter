import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { router } from "expo-router";
import api from "../utils/api";

export default function Signup() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState("");

  const usernameValid = /^[a-z0-9_]{3,20}$/.test(username.trim().toLowerCase());
  const emailValid = /^\S+@\S+\.\S+$/.test(email.trim());
  const allFilled =
    name.trim() &&
    username.trim() &&
    email.trim() &&
    password.trim();

  const handleSignup = async () => {
    setSubmitted(true);
    setServerError("");

    if (!allFilled || !usernameValid || !emailValid) return;

    setLoading(true);

    try {
      await api.post("/auth/signup", {
        name: name.trim(),
        username: username.trim().toLowerCase(),
        email: email.trim().toLowerCase(),
        password,
      });

      router.replace("/login");
    } catch (err: any) {
      setServerError(
        err.response?.data?.error || "Could not create account"
      );
    } finally {
      setLoading(false);
    }
  };

  const fieldStyle = (invalid: boolean) => [
    styles.input,
    invalid && styles.inputError,
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create account</Text>

      <TextInput
        style={fieldStyle(submitted && !name.trim())}
        placeholder="Name"
        placeholderTextColor="#999"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={fieldStyle(submitted && (!username.trim() || !usernameValid))}
        placeholder="Username"
        placeholderTextColor="#999"
        autoCapitalize="none"
        value={username}
        onChangeText={setUsername}
      />
      <Text style={styles.hint}>3-20 characters: letters, numbers and _</Text>

      <TextInput
        style={fieldStyle(submitted && (!email.trim() || !emailValid))}
        placeholder="Email"
        placeholderTextColor="#999"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={fieldStyle(submitted && !password.trim())}
        placeholder="Password"
        placeholderTextColor="#999"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {serverError ? <Text style={styles.serverError}>{serverError}</Text> : null}

      <TouchableOpacity
        style={[styles.button, !allFilled && styles.buttonInactive]}
        onPress={handleSignup}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Creating..." : "Sign Up"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/login")}>
        <Text style={styles.link}>Already have an account? Log in</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 32,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  inputError: {
    borderBottomColor: "#e53935",
    borderBottomWidth: 2,
  },
  hint: {
    color: "#999",
    fontSize: 12,
    marginBottom: 14,
    marginLeft: 4,
  },
  serverError: {
    color: "#e53935",
    fontSize: 13,
    marginTop: 2,
    marginBottom: 4,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#6d5dfc",
    borderRadius: 10,
    padding: 16,
    alignItems: "center",
    marginTop: 8,
  },
  buttonInactive: {
    backgroundColor: "#cfcddc",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  link: {
    color: "#2563eb",
    textAlign: "center",
    marginTop: 18,
  },
});
