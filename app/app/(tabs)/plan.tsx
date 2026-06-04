import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";
import { API_URL } from "@/constants/api";
import { useApp } from "@/context/AppContext";

const VIBES = [
  { id: "chill-sunday", label: "😌 Chill Solo Sunday" },
  { id: "date-night", label: "💕 Date Night" },
  { id: "productive-day", label: "💻 Productive Day" },
  { id: "active-day", label: "🏃 Active Day" },
  { id: "culture-day", label: "🎭 Culture Day" },
  { id: "weekend-adventure", label: "🗺️ Weekend Adventure" },
];

const SLOT_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  morning: "sunny",
  afternoon: "partly-sunny",
  evening: "moon",
};

interface ItinerarySlot {
  slot: string;
  time: string;
  place: { name: string; url: string; snippet: string; why: string };
}

interface Plan {
  vibe: string;
  city: string;
  generatedAt: string;
  itinerary: ItinerarySlot[];
}

export default function PlanScreen() {
  const { profile } = useApp();
  const [vibe, setVibe] = useState("chill-sunday");
  const [customPrompt, setCustomPrompt] = useState("");
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async () => {
    setLoading(true);
    setError(null);
    setPlan(null);
    try {
      const res = await fetch(`${API_URL}/api/plan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vibe,
          city: profile.city,
          tags: profile.tags,
          customPrompt: customPrompt.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to generate plan");
      setPlan(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.scroll}>
        <Text style={s.title}>Plan My Day</Text>
        <Text style={s.sub}>Pick a vibe and Nested builds your full day from real places.</Text>

        {/* Vibe picker */}
        <View style={s.vibes}>
          {VIBES.map((v) => (
            <TouchableOpacity
              key={v.id}
              style={[s.vibe, vibe === v.id && s.vibeActive]}
              onPress={() => setVibe(v.id)}
            >
              <Text style={[s.vibeText, vibe === v.id && s.vibeTextActive]}>{v.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Custom prompt */}
        <Text style={s.label}>Or describe your day</Text>
        <TextInput
          style={s.input}
          value={customPrompt}
          onChangeText={setCustomPrompt}
          placeholder="e.g. A solo day — coffee, a museum, good ramen"
          placeholderTextColor={Colors.gray}
          multiline
        />

        <TouchableOpacity style={[s.btn, loading && s.btnLoading]} onPress={generate} disabled={loading}>
          {loading ? (
            <ActivityIndicator color={Colors.navy} />
          ) : (
            <Text style={s.btnText}>Generate itinerary ✨</Text>
          )}
        </TouchableOpacity>

        {error && (
          <View style={s.errorBox}>
            <Ionicons name="alert-circle" size={16} color="#EF4444" />
            <Text style={s.errorText}>{error}</Text>
          </View>
        )}

        {/* Itinerary */}
        {plan && (
          <View style={s.itinerary}>
            <Text style={s.itineraryTitle}>Your {plan.city} day plan</Text>
            {plan.itinerary.map((slot) => (
              <View key={slot.slot} style={s.slotCard}>
                <View style={s.slotHeader}>
                  <View style={s.slotIconBox}>
                    <Ionicons name={SLOT_ICONS[slot.slot]} size={18} color={Colors.amber} />
                  </View>
                  <View>
                    <Text style={s.slotTime}>{slot.time}</Text>
                    <Text style={s.slotLabel}>{slot.slot}</Text>
                  </View>
                </View>
                <Text style={s.slotName}>{slot.place.name}</Text>
                <Text style={s.slotSnippet} numberOfLines={2}>{slot.place.snippet}</Text>
                <View style={s.whyBox}>
                  <Ionicons name="sparkles" size={12} color={Colors.amber} />
                  <Text style={s.whyText} numberOfLines={2}>{slot.place.why}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 20, paddingBottom: 48 },
  title: { fontSize: 24, fontWeight: "700", color: Colors.text, marginBottom: 6 },
  sub: { fontSize: 14, color: Colors.subtext, marginBottom: 20, lineHeight: 20 },
  vibes: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 20 },
  vibe: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20, backgroundColor: Colors.white, borderWidth: 1.5, borderColor: Colors.lightGray },
  vibeActive: { backgroundColor: Colors.navy, borderColor: Colors.navy },
  vibeText: { fontSize: 13, color: Colors.darkGray, fontWeight: "500" },
  vibeTextActive: { color: Colors.white },
  label: { fontSize: 13, fontWeight: "600", color: Colors.subtext, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 },
  input: { backgroundColor: Colors.white, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: Colors.text, borderWidth: 1, borderColor: Colors.lightGray, minHeight: 60, marginBottom: 20, textAlignVertical: "top" },
  btn: { backgroundColor: Colors.amber, borderRadius: 14, paddingVertical: 15, alignItems: "center", marginBottom: 16 },
  btnLoading: { opacity: 0.7 },
  btnText: { fontSize: 16, fontWeight: "700", color: Colors.navy },
  errorBox: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#FEE2E2", borderRadius: 10, padding: 12, marginBottom: 16 },
  errorText: { fontSize: 13, color: "#DC2626", flex: 1 },
  itinerary: { gap: 12 },
  itineraryTitle: { fontSize: 17, fontWeight: "700", color: Colors.text, marginBottom: 4 },
  slotCard: { backgroundColor: Colors.white, borderRadius: 16, padding: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 1 },
  slotHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
  slotIconBox: { width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.amber + "22", alignItems: "center", justifyContent: "center" },
  slotTime: { fontSize: 14, fontWeight: "700", color: Colors.text },
  slotLabel: { fontSize: 11, color: Colors.subtext, textTransform: "capitalize" },
  slotName: { fontSize: 16, fontWeight: "600", color: Colors.text, marginBottom: 4 },
  slotSnippet: { fontSize: 13, color: Colors.subtext, lineHeight: 18, marginBottom: 8 },
  whyBox: { flexDirection: "row", alignItems: "flex-start", gap: 6, backgroundColor: Colors.amber + "18", borderRadius: 8, padding: 8 },
  whyText: { fontSize: 12, color: Colors.darkGray, flex: 1, lineHeight: 17 },
});
