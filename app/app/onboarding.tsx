import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";

const { width } = Dimensions.get("window");

const SLIDES = [
  {
    emoji: "🪺",
    title: "Move like a local",
    body: "Nested finds places that match your lifestyle — not just what's nearby, but what's right for you.",
  },
  {
    emoji: "✨",
    title: "AI-powered matching",
    body: "We analyze your habits and interests to surface real places with real reasons why they suit you.",
  },
  {
    emoji: "🗺️",
    title: "Your city, your nest",
    body: "Discover, save, and plan your days with a personal map built around how you actually live.",
  },
];

export default function Onboarding() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const ref = useRef<FlatList>(null);

  const next = () => {
    if (index < SLIDES.length - 1) {
      ref.current?.scrollToIndex({ index: index + 1 });
      setIndex(index + 1);
    } else {
      router.push("/onboarding/connect" as never);
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      <FlatList
        ref={ref}
        data={SLIDES}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, i) => String(i)}
        renderItem={({ item }) => (
          <View style={s.slide}>
            <Text style={s.emoji}>{item.emoji}</Text>
            <Text style={s.title}>{item.title}</Text>
            <Text style={s.body}>{item.body}</Text>
          </View>
        )}
      />

      {/* Dots */}
      <View style={s.dots}>
        {SLIDES.map((_, i) => (
          <View key={i} style={[s.dot, i === index && s.dotActive]} />
        ))}
      </View>

      <TouchableOpacity style={s.btn} onPress={next}>
        <Text style={s.btnText}>
          {index < SLIDES.length - 1 ? "Next" : "Get started"}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.navy },
  slide: { width, flex: 1, alignItems: "center", justifyContent: "center", padding: 40 },
  emoji: { fontSize: 72, marginBottom: 24 },
  title: { fontSize: 28, fontWeight: "700", color: Colors.white, textAlign: "center", marginBottom: 16 },
  body: { fontSize: 16, color: Colors.white + "cc", textAlign: "center", lineHeight: 24 },
  dots: { flexDirection: "row", justifyContent: "center", gap: 8, marginBottom: 24 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.white + "44" },
  dotActive: { backgroundColor: Colors.amber, width: 20 },
  btn: { marginHorizontal: 32, marginBottom: 32, backgroundColor: Colors.amber, borderRadius: 14, paddingVertical: 16, alignItems: "center" },
  btnText: { fontSize: 17, fontWeight: "700", color: Colors.navy },
});
