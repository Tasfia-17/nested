import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";
import { useApp } from "@/context/AppContext";

const TAG_LABELS: Record<string, string> = {
  "coffee-explorer": "☕ Coffee Explorer",
  "fitness-regular": "💪 Fitness Regular",
  "food-adventurer": "🍜 Food Adventurer",
  "night-owl": "🦉 Night Owl",
  "culture-seeker": "🎨 Culture Seeker",
  "budget-conscious": "💰 Budget Conscious",
  "nature-lover": "🌿 Nature Lover",
  bookworm: "📚 Bookworm",
  "social-butterfly": "🦋 Social Butterfly",
  homebody: "🏠 Homebody",
};

export default function ProfileScreen() {
  const { profile, updateProfile, savedIds, visitedIds, places, completeOnboarding } = useApp();
  const [editCity, setEditCity] = useState(false);
  const [city, setCity] = useState(profile.city);

  const saveCity = () => {
    updateProfile({ city });
    setEditCity(false);
  };

  const ratedCount = places.filter((p) => p.userRating).length;

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.scroll}>
        <Text style={s.title}>Profile</Text>

        {/* Stats */}
        <View style={s.statsRow}>
          {[
            { label: "Saved", value: savedIds.length },
            { label: "Visited", value: visitedIds.length },
            { label: "Rated", value: ratedCount },
          ].map((stat) => (
            <View key={stat.label} style={s.stat}>
              <Text style={s.statNum}>{stat.value}</Text>
              <Text style={s.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* City */}
        <Text style={s.sectionTitle}>Current city</Text>
        <View style={s.row}>
          {editCity ? (
            <>
              <TextInput style={s.cityInput} value={city} onChangeText={setCity} autoFocus />
              <TouchableOpacity onPress={saveCity} style={s.saveBtn}>
                <Text style={s.saveBtnText}>Save</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={s.cityText}>{profile.city}</Text>
              <TouchableOpacity onPress={() => setEditCity(true)}>
                <Ionicons name="pencil" size={16} color={Colors.navy} />
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Tags */}
        <Text style={s.sectionTitle}>Lifestyle tags</Text>
        <View style={s.tags}>
          {profile.tags.length === 0 ? (
            <Text style={s.noTags}>No tags set — go back to onboarding to set them</Text>
          ) : (
            profile.tags.map((tag) => (
              <View key={tag} style={s.tag}>
                <Text style={s.tagText}>{TAG_LABELS[tag] ?? tag}</Text>
              </View>
            ))
          )}
        </View>

        {/* Preferences */}
        <Text style={s.sectionTitle}>Preferences</Text>
        <View style={s.prefCard}>
          <View style={s.prefRow}>
            <Text style={s.prefLabel}>Budget</Text>
            <View style={s.budgetRow}>
              {(["$", "$$", "$$$"] as const).map((b) => (
                <TouchableOpacity
                  key={b}
                  style={[s.budgetChip, profile.budget === b && s.budgetChipActive]}
                  onPress={() => updateProfile({ budget: b })}
                >
                  <Text style={[s.budgetText, profile.budget === b && s.budgetTextActive]}>{b}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={s.prefDivider} />
          <View style={s.prefRow}>
            <Text style={s.prefLabel}>Max distance</Text>
            <View style={s.distRow}>
              {[1, 2, 5, 10, 20].map((d) => (
                <TouchableOpacity
                  key={d}
                  style={[s.budgetChip, profile.maxDistance === d && s.budgetChipActive]}
                  onPress={() => updateProfile({ maxDistance: d })}
                >
                  <Text style={[s.budgetText, profile.maxDistance === d && s.budgetTextActive]}>{d}mi</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Google */}
        <Text style={s.sectionTitle}>Connected accounts</Text>
        <View style={s.accountRow}>
          <Ionicons name="logo-google" size={20} color={profile.googleConnected ? Colors.emerald : Colors.gray} />
          <Text style={s.accountText}>Google Maps</Text>
          <Text style={[s.accountStatus, { color: profile.googleConnected ? Colors.emerald : Colors.gray }]}>
            {profile.googleConnected ? "Connected" : "Not connected"}
          </Text>
        </View>

        {/* Reset */}
        <TouchableOpacity
          style={s.resetBtn}
          onPress={() => Alert.alert("Reset onboarding?", "This will take you back to the welcome screen.", [
            { text: "Cancel", style: "cancel" },
            { text: "Reset", style: "destructive", onPress: () => completeOnboarding() },
          ])}
        >
          <Text style={s.resetText}>Reset onboarding</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 20, paddingBottom: 48 },
  title: { fontSize: 24, fontWeight: "700", color: Colors.text, marginBottom: 20 },
  statsRow: { flexDirection: "row", backgroundColor: Colors.white, borderRadius: 14, padding: 16, marginBottom: 24 },
  stat: { flex: 1, alignItems: "center" },
  statNum: { fontSize: 24, fontWeight: "700", color: Colors.navy },
  statLabel: { fontSize: 12, color: Colors.subtext, marginTop: 2 },
  sectionTitle: { fontSize: 13, fontWeight: "600", color: Colors.subtext, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10, marginTop: 8 },
  row: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 20 },
  cityText: { fontSize: 16, fontWeight: "600", color: Colors.text },
  cityInput: { flex: 1, backgroundColor: Colors.white, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, fontSize: 15, color: Colors.text, borderWidth: 1, borderColor: Colors.lightGray },
  saveBtn: { backgroundColor: Colors.navy, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8 },
  saveBtnText: { color: Colors.white, fontWeight: "600", fontSize: 13 },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 20 },
  tag: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: Colors.navy + "18" },
  tagText: { fontSize: 13, color: Colors.navy, fontWeight: "500" },
  noTags: { fontSize: 13, color: Colors.subtext },
  prefCard: { backgroundColor: Colors.white, borderRadius: 14, padding: 16, marginBottom: 20 },
  prefRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  prefLabel: { fontSize: 14, color: Colors.text, fontWeight: "500" },
  prefDivider: { height: 1, backgroundColor: Colors.lightGray, marginVertical: 12 },
  budgetRow: { flexDirection: "row", gap: 6 },
  distRow: { flexDirection: "row", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" },
  budgetChip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, backgroundColor: Colors.lightGray },
  budgetChipActive: { backgroundColor: Colors.navy },
  budgetText: { fontSize: 13, color: Colors.darkGray, fontWeight: "500" },
  budgetTextActive: { color: Colors.white },
  accountRow: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: Colors.white, borderRadius: 12, padding: 14, marginBottom: 24 },
  accountText: { fontSize: 15, color: Colors.text, fontWeight: "500", flex: 1 },
  accountStatus: { fontSize: 13, fontWeight: "600" },
  resetBtn: { alignItems: "center", paddingVertical: 12 },
  resetText: { fontSize: 13, color: Colors.gray, textDecorationLine: "underline" },
});
