import React, { useState } from "react";
import { FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PlaceCard } from "@/components/PlaceCard";
import { Colors } from "@/constants/colors";
import { useApp } from "@/context/AppContext";

const TABS = ["Saved", "Visited"];

export default function NestScreen() {
  const { places, savedIds, visitedIds } = useApp();
  const [tab, setTab] = useState("Saved");

  const saved = places.filter((p) => savedIds.includes(p.id));
  const visited = places.filter((p) => visitedIds.includes(p.id));
  const items = tab === "Saved" ? saved : visited;

  return (
    <SafeAreaView style={s.safe}>
      <Text style={s.title}>My Nest 🪺</Text>

      {/* Stats */}
      <View style={s.stats}>
        <View style={s.stat}>
          <Text style={s.statNum}>{savedIds.length}</Text>
          <Text style={s.statLabel}>Saved</Text>
        </View>
        <View style={s.divider} />
        <View style={s.stat}>
          <Text style={s.statNum}>{visitedIds.length}</Text>
          <Text style={s.statLabel}>Visited</Text>
        </View>
        <View style={s.divider} />
        <View style={s.stat}>
          <Text style={s.statNum}>
            {places.filter((p) => p.userRating).length}
          </Text>
          <Text style={s.statLabel}>Rated</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={s.tabs}>
        {TABS.map((t) => (
          <TouchableOpacity
            key={t}
            style={[s.tabBtn, tab === t && s.tabBtnActive]}
            onPress={() => setTab(t)}
          >
            <Text style={[s.tabText, tab === t && s.tabTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {items.length === 0 ? (
        <View style={s.empty}>
          <Text style={s.emptyEmoji}>{tab === "Saved" ? "❤️" : "✅"}</Text>
          <Text style={s.emptyText}>No {tab.toLowerCase()} places yet</Text>
          <Text style={s.emptySub}>
            {tab === "Saved"
              ? "Heart places on the Discover tab to save them here"
              : "Mark places as visited from their detail page"}
          </Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <PlaceCard place={item} />}
          contentContainerStyle={s.list}
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  title: { fontSize: 24, fontWeight: "700", color: Colors.text, padding: 20, paddingBottom: 12 },
  stats: { flexDirection: "row", backgroundColor: Colors.white, marginHorizontal: 16, borderRadius: 14, padding: 16, marginBottom: 16 },
  stat: { flex: 1, alignItems: "center" },
  statNum: { fontSize: 26, fontWeight: "700", color: Colors.navy },
  statLabel: { fontSize: 12, color: Colors.subtext, marginTop: 2 },
  divider: { width: 1, backgroundColor: Colors.lightGray },
  tabs: { flexDirection: "row", marginHorizontal: 16, backgroundColor: Colors.lightGray, borderRadius: 10, padding: 3, marginBottom: 12 },
  tabBtn: { flex: 1, paddingVertical: 8, alignItems: "center", borderRadius: 8 },
  tabBtnActive: { backgroundColor: Colors.white },
  tabText: { fontSize: 14, fontWeight: "500", color: Colors.gray },
  tabTextActive: { color: Colors.text, fontWeight: "700" },
  list: { paddingHorizontal: 16 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 8 },
  emptyEmoji: { fontSize: 40 },
  emptyText: { fontSize: 17, fontWeight: "600", color: Colors.text },
  emptySub: { fontSize: 13, color: Colors.subtext, textAlign: "center", lineHeight: 18 },
});
