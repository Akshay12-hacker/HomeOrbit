import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

export default function ContinueButton({
  title = "Continue",
  loading = false,
  onPress,
  disabled = false,
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={disabled || loading}
      style={[styles.buttonContainer, disabled && { opacity: 0.5 }]}
    >
      <LinearGradient
        // Colors updated to perfectly match the sleek gradient from the mockup
        colors={["#1E62FC", "#17C8C4"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradientBackground}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <View style={styles.contentRow}>
            <Text style={styles.text}>{title}</Text>
            <Ionicons
              name="arrow-forward"
              size={18}
              color="#FFFFFF"
              style={styles.icon}
            />
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    width: "100%",
    height: 54, // Tailored height to match the compact card from the design asset
    borderRadius: 14,
    
    // Balanced drop shadow that won't clip abnormally across platforms
    shadowColor: "#1E62FC",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  gradientBackground: {
    flex: 1,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: "#FFFFFF",
    fontSize: 16, // Trimmed down from 20 to look premium and sharp inside the input card
    fontWeight: "600",
    letterSpacing: -0.1,
  },
  icon: {
    marginLeft: 6,
    transform: [{ translateY: 0.5 }], // Micro-alignment to center vectors vertically against text font lines
  },
});