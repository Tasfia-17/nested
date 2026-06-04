import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Linking,
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

interface LiveDetails {
  hours?: string;
  phone?: string;
  website?: string;
}

export default function PlaceDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { places, savedIds, visitedIds, toggleSaved, toggleVisited, updatePlaceNote, updatePlaceRating } = useApp();

  const place = places.find((p) => p.id === id);
  const isSaved = savedIds.includes(id);
  const isVisited = visitedIds.includes(id);

  const [note, setNote] = useState(place?.notes ?? "");
  const [live, setLive] = useState<LiveDetails | null>(null);
  const [liveLoading, setLiveLoading] = useState(false);

  useEffect(() => {
    if (!place?.url) return;
    setLiveLoading(true);
    fetch(`${API_URL}/api/places/extract?url=${encodeURIComponent(place.url)}`)
      .then((r) => r.json())
      .then((d) => setLive({ hours: d.hours, phone: d.phone, website: d.website }))
      .catch(() => {})
      .finally(() => setLiveLoading(false));
  }, [place?.url]);

  if (!place) {
    return (
      <SafeAreaView style={s.safe}>
        <TouchableOpacity style={s.back} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={Colors.navy} />
        </TouchableOpacity>
        <View style={s.notFound}>
          <Text style={s.notFoundText}>Place not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const catColor = Colors.categories[place.category] ?? Colors.navy;

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header image placeholder */}
        <View style={[s.hero, { backgroundColor: catColor + "33" }]}>
          <TouchableOpacity style={s.back} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={Colors.navy} />
          </TouchableOpacity>
          <Text style={s.heroEmoji}>
            {place.category === "food" ? "🍴" : place.category === "fitness" ? "💪" : place.category === "culture" ? "🎨" : "☕"}
          </Text>
        </View>

        <View style={s.body}>
          {/* Name & actions */}
          <View style={s.nameRow}>
            <Text style={s.name}>{place.name}</Text>
            <TouchableOpacity onPress={() => toggleSaved(id)}>
              <Ionicons name={isSaved ? "heart" : "heart-outline"} size={26} color={isSaved ? "#EF4444" : Colors.gray} />
            </TouchableOpacity>
          </View>

          <Text style={s.address}>{place.address}</Text>

          {/* Match reason */}
          <View style={s.matchBox}>
            <Ionicons name="sparkles" size={14} color={Colors.amber} />
            <Text style={s.matchText}>{place.matchReason}</Text>
          </View>

          {/* Rating row */}
          <View style={s.metaRow}>
            <View style={s.metaItem}>
              <Ionicons name="star" size={14} color={Colors.amber} />
              <Text style={s.metaText}>{place.rating.toFixed(1)} rating</Text>
            </View>
            <View style={s.metaItem}>
              <Ionicons name="location" size={14} color={Colors.navy} />
              <Text style={s.metaText}>{place.distance} mi away</Text>
            </View>
            <View style={[s.catBadge, { backgroundColor: catColor + "22" }]}>
              <Text style={[s.catText, { color: catColor }]}>{place.category}</Text>
            </View>
          </View>

          {/* Live details from Nimble */}
          <Text style={s.sectionTitle}>Live details</Text>
          {liveLoading ? (
            <ActivityIndicator color={Colors.amber} style={s.liveLoading} />
          ) : live ? (
            <View style={s.liveCard}>
              {live.hours && (
                <View style={s.liveRow}>
                  <Ionicons name="time" size={15} color={Colors.subtext} />
                  <Text style={s.liveText}>{live.hours}</Text>
                </View>
              )}
              {live.phone && (
                <TouchableOpacity style={s.liveRow} onPress={() => Linking.openURL(`tel:${live.phone}`)}>
                  <Ionicons name="call" size={15} color={Colors.subtext} />
                  <Text style={[s.liveText, s.liveLink]}>{live.phone}</Text>
                </TouchableOpacity>
              )}
              {live.website && (
                <TouchableOpacity style={s.liveRow} onPress={() => Linking.openURL(live.website!)}>
                  <Ionicons name="globe" size={15} color={Colors.subtext} />
                  <Text style={[s.liveText, s.liveLink]} numberOfLines={1}>{live.website}</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <Text style={s.noLive}>No live details available</Text>
          )}

          {/* Your rating */}
          <Text style={s.sectionTitle}>Your rating</Text>
          <View style={s.stars}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => updatePlaceRating(id, star)}>
                <Ionicons
                  name={star <= (place.userRating ?? 0) ? "star" : "star-outline"}
                  size={32}
                  color={Colors.amber}
                />
              </TouchableOpacity>
            ))}
          </View>

          {/* Notes */}
          <Text style={s.sectionTitle}>Personal notes</Text>
          <TextInput
            style={s.noteInput}
            value={note}
            onChangeText={setNote}
            onBlur={() => updatePlaceNote(id, note)}
            placeholder="E.g. grab the window seat — great for morning work"
            placeholderTextColor={Colors.gray}
            multiline
          />

          {/* Visited */}
          <TouchableOpacity
            style={[s.visitedBtn, isVisited && s.visitedBtnActive]}
            onPress={() => toggleVisited(id)}
          >
            <Ionicons name={isVisited ? "checkmark-circle" : "checkmark-circle-outline"} size={20} color={isVisited ? Colors.white : Colors.navy} />
            <Text style={[s.visitedText, isVisited && s.visitedTextActive]}>
              {isVisited ? "Visited ✓" : "Mark as visited"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  hero: { height: 200, alignItems: "center", justifyContent: "center" },
  back: { position: "absolute", top: 16, left: 16, width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.white + "cc", alignItems: "center", justifyContent: "center" },
  heroEmoji: { fontSize: 64 },
  body: { padding: 20, paddingBottom: 48 },
  nameRow: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 6 },
  name: { fontSize: 22, fontWeight: "700", color: Colors.text, flex: 1 },
  address: { fontSize: 14, color: Colors.subtext, marginBottom: 14 },
  matchBox: { flexDirection: "row", gap: 8, backgroundColor: Colors.amber + "18", borderRadius: 10, padding: 10, marginBottom: 14, alignItems: "flex-start" },
  matchText: { fontSize: 13, color: Colors.darkGray, flex: 1, lineHeight: 18 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 24, flexWrap: "wrap" },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontSize: 13, color: Colors.darkGray },
  catBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  catText: { fontSize: 12, fontWeight: "600", textTransform: "capitalize" },
  sectionTitle: { fontSize: 13, fontWeight: "600", color: Colors.subtext, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10, marginTop: 4 },
  liveLoading: { marginBottom: 16 },
  liveCard: { backgroundColor: Colors.white, borderRadius: 12, padding: 14, gap: 10, marginBottom: 20 },
  liveRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  liveText: { fontSize: 14, color: Colors.text },
  liveLink: { color: Colors.navy, textDecorationLine: "underline" },
  noLive: { fontSize: 13, color: Colors.gray, marginBottom: 20 },
  stars: { flexDirection: "row", gap: 4, marginBottom: 20 },
  noteInput: { backgroundColor: Colors.white, borderRadius: 12, padding: 14, fontSize: 14, color: Colors.text, borderWidth: 1, borderColor: Colors.lightGray, minHeight: 80, textAlignVertical: "top", marginBottom: 20 },
  visitedBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 14, paddingVertical: 15, borderWidth: 1.5, borderColor: Colors.navy },
  visitedBtnActive: { backgroundColor: Colors.emerald, borderColor: Colors.emerald },
  visitedText: { fontSize: 16, fontWeight: "600", color: Colors.navy },
  visitedTextActive: { color: Colors.white },
  notFound: { flex: 1, alignItems: "center", justifyContent: "center" },
  notFoundText: { fontSize: 16, color: Colors.subtext },
});
