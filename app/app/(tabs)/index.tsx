import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PlaceCard } from "@/components/PlaceCard";
import { Colors } from "@/constants/colors";
import { useApp } from "@/context/AppContext";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "food", label: "🍴 Food" },
  { id: "fitness", label: "💪 Fitness" },
  { id: "chill", label: "☕ Chill" },
  { id: "culture", label: "🎨 Culture" },
];

export default function HomeScreen() {
  const { places, loading, fetchPlaces, profile } = useApp();
  const [activeFilter, setActiveFilter] = useState("all");
  const [locationStatus, setLocationStatus] = useState<string | null>(null);
  const coordsRef = React.useRef<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationStatus(status);
      if (status === "granted") {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        coordsRef.current = { lat: loc.coords.latitude, lng: loc.coords.longitude };
      }
      fetchPlaces("all", coordsRef.current ?? undefined);
    })();
  }, []);

  useEffect(() => {
    fetchPlaces(activeFilter, coordsRef.current ?? undefined);
  }, [activeFilter]);

  const filtered =
    activeFilter === "all"
      ? places
      : places.filter((p) => p.category === activeFilter);

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.greeting}>Good morning 🪺</Text>
          <Text style={s.city}>{profile.city}</Text>
        </View>
        {locationStatus !== "granted" && (
          <View style={s.locBadge}>
            <Ionicons name="location-outline" size={14} color={Colors.amber} />
            <Text style={s.locText}>Location needed</Text>
          </View>
        )}
      </View>

      {/* Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filters} contentContainerStyle={s.filterContent}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.id}
            style={[s.filter, activeFilter === f.id && s.filterActive]}
            onPress={() => setActiveFilter(f.id)}
          >
            <Text style={[s.filterText, activeFilter === f.id && s.filterTextActive]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Place list */}
      {loading ? (
        <View style={s.center}>
          <ActivityIndicator size="large" color={Colors.amber} />
          <Text style={s.loadingText}>Finding your places…</Text>
        </View>
      ) : filtered.length === 0 ? (
        <View style={s.center}>
          <Text style={s.emptyEmoji}>🔍</Text>
          <Text style={s.emptyText}>No places found.</Text>
          <Text style={s.emptySub}>Try a different filter or update your city in Profile.</Text>
          <TouchableOpacity style={s.retryBtn} onPress={() => fetchPlaces(activeFilter)}>
            <Text style={s.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <PlaceCard place={item} />}
          contentContainerStyle={s.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", padding: 20, paddingBottom: 12 },
  greeting: { fontSize: 22, fontWeight: "700", color: Colors.text },
  city: { fontSize: 14, color: Colors.subtext, marginTop: 2 },
  locBadge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: Colors.amber + "22", borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 },
  locText: { fontSize: 11, color: Colors.amber, fontWeight: "600" },
  filters: { paddingLeft: 16 },
  filterContent: { paddingRight: 16, gap: 8, paddingBottom: 12 },
  filter: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.lightGray },
  filterActive: { backgroundColor: Colors.navy, borderColor: Colors.navy },
  filterText: { fontSize: 13, fontWeight: "500", color: Colors.subtext },
  filterTextActive: { color: Colors.white },
  list: { padding: 16, paddingTop: 4 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 8, padding: 32 },
  loadingText: { fontSize: 14, color: Colors.subtext, marginTop: 8 },
  emptyEmoji: { fontSize: 40 },
  emptyText: { fontSize: 17, fontWeight: "600", color: Colors.text },
  emptySub: { fontSize: 13, color: Colors.subtext, textAlign: "center" },
  retryBtn: { marginTop: 8, backgroundColor: Colors.navy, borderRadius: 10, paddingHorizontal: 20, paddingVertical: 10 },
  retryText: { color: Colors.white, fontWeight: "600" },
});
