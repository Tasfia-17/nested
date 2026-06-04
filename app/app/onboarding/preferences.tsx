import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";
import { useApp } from "@/context/AppContext";

const BUDGETS: Array<"$" | "$$" | "$$$"> = ["$", "$$", "$$$"];
const DISTANCES = [1, 2, 5, 10, 20];
const INTERESTS = ["Food", "Fitness", "Coffee", "Culture", "Nature", "Nightlife", "Shopping", "Sport"];

export default function Preferences() {
  const router = useRouter();
  const { updateProfile, completeOnboarding } = useApp();

  const [budget, setBudget] = useState<"$" | "$$" | "$$$">("$$");
  const [distance, setDistance] = useState(5);
  const [city, setCity] = useState("New York");
  const [interests, setInterests] = useState<string[]>([]);

  const toggleInterest = (i: string) =>
    setInterests((prev) => prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]);

  const finish = () => {
    updateProfile({ budget, maxDistance: distance, city });
    completeOnboarding();
    router.replace("/(tabs)/" as never);
  };

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.scroll}>
        <Text style={s.title}>Set your preferences</Text>
        <Text style={s.sub}>Help Nested find places that fit how you live and what you can spend.</Text>

        {/* City */}
        <Text style={s.label}>Your new city</Text>
        <TextInput
          style={s.input}
          value={city}
          onChangeText={setCity}
          placeholder="e.g. New York, Austin, Berlin"
          placeholderTextColor={Colors.gray}
        />

        {/* Budget */}
        <Text style={s.label}>Budget</Text>
        <View style={s.row}>
          {BUDGETS.map((b) => (
            <TouchableOpacity
              key={b}
              style={[s.chip, budget === b && s.chipActive]}
              onPress={() => setBudget(b)}
            >
              <Text style={[s.chipText, budget === b && s.chipTextActive]}>{b}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Distance */}
        <Text style={s.label}>Max distance</Text>
        <View style={s.row}>
          {DISTANCES.map((d) => (
            <TouchableOpacity
              key={d}
              style={[s.chip, distance === d && s.chipActive]}
              onPress={() => setDistance(d)}
            >
              <Text style={[s.chipText, distance === d && s.chipTextActive]}>{d} mi</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Interests */}
        <Text style={s.label}>Interests (optional)</Text>
        <View style={s.tags}>
          {INTERESTS.map((i) => (
            <TouchableOpacity
              key={i}
              style={[s.chip, interests.includes(i) && s.chipActive]}
              onPress={() => toggleInterest(i)}
            >
              <Text style={[s.chipText, interests.includes(i) && s.chipTextActive]}>{i}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={s.btn} onPress={finish}>
          <Text style={s.btnText}>Start exploring 🪺</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 24, paddingBottom: 48 },
  title: { fontSize: 24, fontWeight: "700", color: Colors.text, marginBottom: 8 },
  sub: { fontSize: 14, color: Colors.subtext, marginBottom: 28, lineHeight: 20 },
  label: { fontSize: 13, fontWeight: "600", color: Colors.subtext, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10, marginTop: 20 },
  input: { backgroundColor: Colors.white, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 13, fontSize: 15, color: Colors.text, borderWidth: 1, borderColor: Colors.lightGray },
  row: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, backgroundColor: Colors.white, borderWidth: 1.5, borderColor: Colors.lightGray },
  chipActive: { backgroundColor: Colors.navy, borderColor: Colors.navy },
  chipText: { fontSize: 14, color: Colors.darkGray, fontWeight: "500" },
  chipTextActive: { color: Colors.white },
  btn: { marginTop: 36, backgroundColor: Colors.amber, borderRadius: 14, paddingVertical: 16, alignItems: "center" },
  btnText: { fontSize: 16, fontWeight: "700", color: Colors.navy },
});
