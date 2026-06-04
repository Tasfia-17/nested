import { Ionicons } from "@expo/vector-icons";
import * as Google from "expo-auth-session/providers/google";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";
import { useApp } from "@/context/AppContext";

WebBrowser.maybeCompleteAuthSession();

// Replace with your real Expo / Google OAuth client IDs from Google Cloud Console
const EXPO_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID ?? "";

export default function Connect() {
  const router = useRouter();
  const { updateProfile } = useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: EXPO_CLIENT_ID,
    scopes: ["profile", "email"],
  });

  useEffect(() => {
    if (response?.type === "success") {
      updateProfile({ googleConnected: true });
      router.push("/onboarding/profile" as never);
    } else if (response?.type === "error") {
      setError("Google sign-in failed. Try again or skip.");
      setLoading(false);
    } else if (response?.type === "dismiss") {
      setLoading(false);
    }
  }, [response]);

  const connectGoogle = async () => {
    if (!EXPO_CLIENT_ID) {
      // No client ID configured — still mark connected and proceed
      updateProfile({ googleConnected: true });
      router.push("/onboarding/profile" as never);
      return;
    }
    setLoading(true);
    setError(null);
    await promptAsync();
  };

  const skip = () => router.push("/onboarding/profile" as never);

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.content}>
        <Text style={s.emoji}>🔗</Text>
        <Text style={s.title}>Connect Google</Text>
        <Text style={s.body}>
          Connect your Google account so Nested can analyze your maps history
          and build your lifestyle profile automatically.
        </Text>

        <View style={s.benefits}>
          {["Your favorite cuisines", "How often you visit the gym", "Coffee shop habits", "Weekend vs weekday patterns"].map((b) => (
            <View key={b} style={s.benefit}>
              <Ionicons name="checkmark-circle" size={18} color={Colors.emerald} />
              <Text style={s.benefitText}>{b}</Text>
            </View>
          ))}
        </View>

        {error && <Text style={s.error}>{error}</Text>}

        <TouchableOpacity style={s.googleBtn} onPress={connectGoogle} disabled={loading || !request}>
          {loading ? (
            <ActivityIndicator color={Colors.navy} />
          ) : (
            <>
              <Ionicons name="logo-google" size={20} color={Colors.navy} />
              <Text style={s.googleText}>Connect Google Maps</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={skip}>
          <Text style={s.skip}>Skip — I'll pick manually</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  content: { flex: 1, padding: 32, justifyContent: "center" },
  emoji: { fontSize: 56, marginBottom: 16 },
  title: { fontSize: 26, fontWeight: "700", color: Colors.text, marginBottom: 12 },
  body: { fontSize: 15, color: Colors.subtext, lineHeight: 22, marginBottom: 28 },
  benefits: { gap: 12, marginBottom: 36 },
  benefit: { flexDirection: "row", alignItems: "center", gap: 10 },
  benefitText: { fontSize: 14, color: Colors.darkGray },
  error: { fontSize: 13, color: "#DC2626", marginBottom: 12, textAlign: "center" },
  googleBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, backgroundColor: Colors.amber, borderRadius: 14, paddingVertical: 16, marginBottom: 16, minHeight: 52 },
  googleText: { fontSize: 16, fontWeight: "700", color: Colors.navy },
  skip: { textAlign: "center", fontSize: 14, color: Colors.subtext, textDecorationLine: "underline" },
});
