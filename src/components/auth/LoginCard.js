import React from "react";
import { StyleSheet, Text, View } from "react-native";

import ContinueButton from "./ContinueButton";
import PhoneInput from "./PhoneInput";
import SecureFooter from "./SecureFooter";

export default function LoginCard({
  phone,
  onChangePhone, // Aligned with your LoginScreen prop
  error,
  loading,
  onSubmit,      // Aligned with your LoginScreen prop
  disabled,
}) {
  return (
    <View style={styles.card}>
      {/* Field Label */}
      

      {/* Phone Input Box */}
      <PhoneInput 
        value={phone} 
        onChangeText={onChangePhone} 
        error={error} 
      />

      {/* Button Section */}
      <View style={styles.buttonContainer}>
        <ContinueButton
          title="Continue"
          loading={loading}
          disabled={disabled || phone.length !== 10}
          onPress={onSubmit}
        />
      </View>

      {/* Secure footer row */}
      <View style={styles.footerContainer}>
        <SecureFooter />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignSelf: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
    width: "100%",
    maxWidth: 400,
    
    // Shadow matching the neat profile of the design image
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E293B", // Dark slate grey text
    marginBottom: 8,
  },
  buttonContainer: {
    marginTop: 18,
  },
  footerContainer: {
    marginTop: 16,
    alignItems: "center",
    justifyContent: "center",
  },
});