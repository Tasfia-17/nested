import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Animated, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";
import { useApp } from "@/context/AppContext";

const ALL_TAGS = [
  { id: "coffee-explorer", label: "☕ Coffee Explorer" },
  { id: "fitness-regular", label: "💪 Fitness Regular" },
  { id: "food-adventurer", label: "🍜 Food Adventurer" },
  { id: "night-owl", label: "🦉 Night Owl" },
  { id: "culture-seeker", label: "🎨 Culture Seeker" },
  { id: "budget-conscious", label: "💰 Budget Conscious" },
  { id: "nature-lover", label: "🌿 Nature Lover" },
  { id: "bookworm", label: "📚 Bookworm" },
  { id: "social-butterfly", label: "🦋 Social Butterfly" },
  { id: "homebody", label: "🏠 Homebody" },
];

export default function Profile() {
  const router = useRouter();
  const { updateProfile } = useApp();
  const [analysing, setAnalysing] = useState(true);
  const [selected, setSelected] = useState<string[]>([]);
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, { toValue: 1, duration: 2000, useNativeDriver: false }).start(() => {
      setAnalysing(false);
    });
  }, []);

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const next = () => {
    updateProfile({ tags: selected });
    router.push("/onboarding/preferences" as never);
  };

  const barWidth = progress.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] });

  if (analysing) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.analysing}>
          <Text style={s.analysingEmoji}>🤖</Text>
          <Text style={s.analysingTitle}>Analysing your lifestyle…</Text>
          <View style={s.barBg}>
            <Animated.View style={[s.barFill, { width: barWidth }]} />
          </View>
          <Text style={s.analysingHint}>Powered by Nimble live web intelligence</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.scroll}>
        <Text style={s.title}>Your lifestyle tags</Text>
        <Text style={s.sub}>Pick the tags that describe how you live. We'll use these to match places.</Text>

        <View style={s.tags}>
          {ALL_TAGS.map((tag) => {
            const active = selected.includes(tag.id);
            return (
              <TouchableOpacity
                key={tag.id}
                style={[s.tag, active && s.tagActive]}
                onPress={() => toggle(tag.id)}
              >
                <Text style={[s.tagText, active && s.tagTextActive]}>{tag.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          style={[s.btn, selected.length === 0 && s.btnDisabled]}
          onPress={next}
          disabled={selected.length === 0}
        >
          <Text style={s.btnText}>Continue ({selected.length} selected)</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  analysing: { flex: 1, alignItems: "center", justifyContent: "center", padding: 40 },
  analysingEmoji: { fontSize: 60, marginBottom: 20 },
  analysingTitle: { fontSize: 22, fontWeight: "700", color: Colors.text, marginBottom: 24 },
  barBg: { width: "100%", height: 8, backgroundColor: Colors.lightGray, borderRadius: 4, overflow: "hidden" },
  barFill: { height: 8, backgroundColor: Colors.amber, borderRadius: 4 },
  analysingHint: { marginTop: 12, fontSize: 12, color: Colors.subtext },
  scroll: { padding: 24, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: "700", color: Colors.text, marginBottom: 8 },
  sub: { fontSize: 14, color: Colors.subtext, marginBottom: 24, lineHeight: 20 },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 32 },
  tag: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20, backgroundColor: Colors.white, borderWidth: 1.5, borderColor: Colors.lightGray },
  tagActive: { backgroundColor: Colors.navy, borderColor: Colors.navy },
  tagText: { fontSize: 14, color: Colors.darkGray, fontWeight: "500" },
  tagTextActive: { color: Colors.white },
  btn: { backgroundColor: Colors.amber, borderRadius: 14, paddingVertical: 16, alignItems: "center" },
  btnDisabled: { opacity: 0.4 },
  btnText: { fontSize: 16, fontWeight: "700", color: Colors.navy },
});
