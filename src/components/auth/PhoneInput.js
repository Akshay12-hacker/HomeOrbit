import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function PhoneInput({
  value,
  onChangeText,
  error,
  onCountryPress,
}) {
  return (
    <View style={styles.container}>
      <View
        style={[
          styles.inputContainer,
          error ? styles.inputError : styles.inputNormal,
        ]}
      >
        {/* Country Picker */}
        <TouchableOpacity
          style={styles.countryContainer}
          activeOpacity={0.7}
          onPress={onCountryPress}
        >
          <Text style={styles.flag}>🇮🇳</Text>
          <Text style={styles.countryCode}>+91</Text>
          <Ionicons
            name="chevron-down"
            size={14}
            color="#475569"
            style={styles.chevron}
          />
        </TouchableOpacity>

        {/* Vertical Divider Line */}
        <View style={styles.divider} />

        {/* Phone Number Field */}
        <TextInput
          placeholder="Enter your mobile number"
          placeholderTextColor="#A0AEC0"
          keyboardType="phone-pad"
          textContentType="telephoneNumber"
          autoComplete="tel"
          returnKeyType="done"
          value={value}
          onChangeText={(text) => onChangeText(text.replace(/[^0-9]/g, ""))}
          maxLength={10}
          style={styles.input}
        />
      </View>

      {/* Inline Validation Error Display */}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 54, // Adjusted from 64 to sit clean inside the card layout
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: "#FFFFFF",
  },
  inputNormal: {
    borderColor: "#CBD5E1", // Soft light grey border matching the mockup profile
  },
  inputError: {
    borderColor: "#EF4444", // Crisp crimson active error validation state
  },
  countryContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 14,
    paddingRight: 10,
    height: "100%",
  },
  flag: {
    fontSize: 18,
  },
  countryCode: {
    fontSize: 15,
    color: "#1E293B",
    fontWeight: "500",
    marginLeft: 8,
    marginRight: 4,
  },
  chevron: {
    transform: [{ translateY: 1 }], // Micro-alignment adjustment
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: "#E2E8F0",
  },
  input: {
    flex: 1,
    height: "100%",
    paddingHorizontal: 14,
    fontSize: 15,
    color: "#1E293B",
  },
  errorText: {
    color: "#EF4444",
    marginTop: 6,
    fontSize: 12,
    fontWeight: "500",
    paddingLeft: 2,
  },
});