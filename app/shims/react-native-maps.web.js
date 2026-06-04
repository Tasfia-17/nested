// Web stub — react-native-maps is native-only
import React from "react";
import { View, Text, StyleSheet } from "react-native";

export const MapView = ({ children, style }) => (
  <View style={[styles.map, style]}>
    <Text style={styles.text}>🗺 Map view is available on iOS & Android</Text>
    {children}
  </View>
);

export const Marker = () => null;
export const Callout = () => null;
export default MapView;

const styles = StyleSheet.create({
  map: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#e8ecf0" },
  text: { color: "#666", fontSize: 14 },
});
