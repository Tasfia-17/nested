import { useRouter } from "expo-router";
import * as Location from "expo-location";
import React, { useEffect, useState } from "react";
import { FlatList, Platform, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";
import { PlaceCard } from "@/components/PlaceCard";
import { useApp } from "@/context/AppContext";

// react-native-maps is shimmed on web via metro.config.js
let MapView: any = null, Marker: any = null;
if (Platform.OS !== "web") {
  const RNMaps = require("react-native-maps");
  MapView = RNMaps.default;
  Marker = RNMaps.Marker;
}

const CATEGORY_COLORS: Record<string, string> = {
  food: Colors.amber,
  fitness: Colors.emerald,
  chill: Colors.purple,
  culture: Colors.red,
};

const DEFAULT_REGION = { latitude: 40.7128, longitude: -74.006, latitudeDelta: 0.05, longitudeDelta: 0.05 };

export default function MapScreen() {
  const { places, fetchPlaces } = useApp();
  const router = useRouter();
  const [region, setRegion] = useState(DEFAULT_REGION);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        const coords = { lat: loc.coords.latitude, lng: loc.coords.longitude };
        setRegion({ latitude: coords.lat, longitude: coords.lng, latitudeDelta: 0.05, longitudeDelta: 0.05 });
        fetchPlaces("all", coords);
      }
    })();
  }, []);

  if (Platform.OS === "web") {
    return (
      <SafeAreaView style={s.safe}>
        <Text style={s.title}>Nearby Places</Text>
        <FlatList
          data={places}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <PlaceCard place={item} compact />}
          contentContainerStyle={s.list}
        />
      </SafeAreaView>
    );
  }

  return (
    <View style={s.flex}>
      <MapView style={s.flex} showsUserLocation showsMyLocationButton initialRegion={region} region={region}>
        {places
          .filter((p) => p.lat && p.lng)
          .map((place) => (
            <Marker
              key={place.id}
              coordinate={{ latitude: place.lat!, longitude: place.lng! }}
              pinColor={CATEGORY_COLORS[place.category] ?? Colors.navy}
              title={place.name}
              description={place.matchReason}
              onCalloutPress={() => router.push(`/place/${place.id}` as never)}
            />
          ))}
      </MapView>

      {/* Legend */}
      <View style={s.legend}>
        {Object.entries(CATEGORY_COLORS).map(([cat, color]) => (
          <View key={cat} style={s.legendItem}>
            <View style={[s.legendDot, { backgroundColor: color }]} />
            <Text style={s.legendText}>{cat}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1 },
  safe: { flex: 1, backgroundColor: Colors.background },
  title: { fontSize: 22, fontWeight: "700", color: Colors.text, padding: 20, paddingBottom: 12 },
  list: { paddingHorizontal: 16 },
  legend: { position: "absolute", bottom: 24, left: 16, backgroundColor: Colors.white, borderRadius: 12, padding: 12, flexDirection: "row", gap: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 3 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 12, color: Colors.darkGray, textTransform: "capitalize" },
});
