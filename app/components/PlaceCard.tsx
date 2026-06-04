import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors } from "@/constants/colors";
import { Place } from "@/context/AppContext";
import { useApp } from "@/context/AppContext";

interface Props {
  place: Place;
  compact?: boolean;
}

const CATEGORY_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  food: "restaurant",
  fitness: "fitness",
  chill: "cafe",
  culture: "library",
};

export function PlaceCard({ place, compact = false }: Props) {
  const router = useRouter();
  const { savedIds, toggleSaved } = useApp();
  const isSaved = savedIds.includes(place.id);
  const catColor = Colors.categories[place.category] ?? Colors.navy;
  const icon = CATEGORY_ICONS[place.category] ?? "location";

  if (compact) {
    return (
      <TouchableOpacity
        style={s.compact}
        onPress={() => router.push(`/place/${place.id}` as never)}
        activeOpacity={0.8}
      >
        <View style={[s.compactIcon, { backgroundColor: catColor + "22" }]}>
          <Ionicons name={icon} size={18} color={catColor} />
        </View>
        <View style={s.compactInfo}>
          <Text style={s.compactName} numberOfLines={1}>{place.name}</Text>
          <Text style={s.compactSub} numberOfLines={1}>{place.address}</Text>
        </View>
        <View style={s.compactMeta}>
          <Text style={s.rating}>★ {place.rating.toFixed(1)}</Text>
          <Text style={s.dist}>{place.distance} mi</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={s.card}
      onPress={() => router.push(`/place/${place.id}` as never)}
      activeOpacity={0.85}
    >
      {/* Header */}
      <View style={s.cardHeader}>
        <View style={[s.catBadge, { backgroundColor: catColor + "22" }]}>
          <Ionicons name={icon} size={14} color={catColor} />
          <Text style={[s.catText, { color: catColor }]}>{place.category}</Text>
        </View>
        <TouchableOpacity onPress={() => toggleSaved(place.id)} hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}>
          <Ionicons
            name={isSaved ? "heart" : "heart-outline"}
            size={22}
            color={isSaved ? "#EF4444" : Colors.gray}
          />
        </TouchableOpacity>
      </View>

      {/* Name */}
      <Text style={s.name} numberOfLines={2}>{place.name}</Text>
      <Text style={s.address} numberOfLines={1}>{place.address}</Text>

      {/* Match reason */}
      <View style={s.matchBox}>
        <Ionicons name="sparkles" size={13} color={Colors.amber} />
        <Text style={s.matchText} numberOfLines={2}>{place.matchReason}</Text>
      </View>

      {/* Footer */}
      <View style={s.footer}>
        <View style={s.ratingRow}>
          <Ionicons name="star" size={13} color={Colors.amber} />
          <Text style={s.ratingText}>{place.rating.toFixed(1)}</Text>
        </View>
        <Text style={s.distText}>{place.distance} mi away</Text>
        {place.userRating ? (
          <View style={s.yourRating}>
            <Ionicons name="person" size={11} color={Colors.navy} />
            <Text style={s.yourRatingText}>{place.userRating}★</Text>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  catBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  catText: { fontSize: 11, fontWeight: "600", textTransform: "capitalize" },
  name: { fontSize: 17, fontWeight: "700", color: Colors.text, marginBottom: 4 },
  address: { fontSize: 13, color: Colors.subtext, marginBottom: 10 },
  matchBox: { flexDirection: "row", alignItems: "flex-start", gap: 6, backgroundColor: Colors.amber + "18", borderRadius: 8, padding: 8, marginBottom: 12 },
  matchText: { fontSize: 12, color: Colors.darkGray, flex: 1, lineHeight: 17 },
  footer: { flexDirection: "row", alignItems: "center", gap: 12 },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  ratingText: { fontSize: 13, fontWeight: "600", color: Colors.text },
  distText: { fontSize: 13, color: Colors.subtext },
  yourRating: { flexDirection: "row", alignItems: "center", gap: 3, marginLeft: "auto" },
  yourRatingText: { fontSize: 12, color: Colors.navy, fontWeight: "600" },
  // compact
  compact: { flexDirection: "row", alignItems: "center", backgroundColor: Colors.card, borderRadius: 12, padding: 12, marginBottom: 8, gap: 12 },
  compactIcon: { width: 40, height: 40, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  compactInfo: { flex: 1 },
  compactName: { fontSize: 14, fontWeight: "600", color: Colors.text },
  compactSub: { fontSize: 12, color: Colors.subtext, marginTop: 2 },
  compactMeta: { alignItems: "flex-end", gap: 2 },
  rating: { fontSize: 12, fontWeight: "600", color: Colors.amber },
  dist: { fontSize: 11, color: Colors.subtext },
});
