import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function SecureFooter() {
  return (
    <View style={styles.container}>
      {/* Sleek, minimal checkmark shield matching the design illustration */}
      <Ionicons
        name="shield-checkmark-outline"
        size={16}
        color="#2575FC" // Theme blue matching your main active accents
        style={styles.icon}
      />
      <Text style={styles.text}>
        Secure login. Your data is protected.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  icon: {
    marginRight: 6,
    transform: [{ translateY: 0.5 }], // Vertically aligns perfectly with standard typography baselines
  },
  text: {
    fontSize: 12, // Scaled down to match the clean layout proportions inside the card
    color: "#94A3B8", // Soft slate/grey tone matching the exact style of the mockup
    fontWeight: "400",
  },
});