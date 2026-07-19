import React, { useState } from "react";
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
  Text,
  TouchableOpacity,
} from "react-native";

import AnimatedLogo from "../../components/splash/AnimatedLogo";
import Cityscape from "../../components/splash/Cityscape";
import BottomWave from "../../components/splash/BottomWave";
import LoginCard from "../../components/auth/LoginCard";
import { sendOTP } from "../../services";

const { width } = Dimensions.get("window");

export default function LoginScreen({ navigation }) {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSendOTP = async () => {
    const mobileNumber = phone.replace(/\D/g, "");

    if (mobileNumber.length !== 10) {
      setError("Please enter a valid mobile number");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await sendOTP(mobileNumber);
      navigation.navigate("OTP", { phone: mobileNumber });
    } catch (e) {
      setError(e.message || "Unable to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      {/* BACKGROUND DECORATIONS (GLOW & CIRCLES) */}

      <View style={[styles.circle, styles.circleOne]} />
      <View style={[styles.circle, styles.circleTwo]} />
      <View style={[styles.circle, styles.circleThree]} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          bounces={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* 1. TOP SECTION: LOGO & HEADERS */}
          <View style={styles.logoSection}>
            <AnimatedLogo />
          </View>

          <View style={styles.headingSection}>
            <Text style={styles.welcomeText}>Welcome Back</Text>
            <Text style={styles.subText}>Login to continue to your account</Text>
          </View>

          {/* 2. MIDDLE SECTION: THE INTERACTIVE CARD */}
          <View style={styles.cardContainer}>
            <LoginCard
              phone={phone}
              onChangePhone={setPhone}
              loading={loading}
              error={error}
              onSubmit={handleSendOTP}
            />
          </View>
          
          {/* FLEXIBLE PUSH SPACER */}
          <View style={styles.spacer} />

          {/* 3. BOTTOM SECTION: FLOATING WAVE OVER CITYSCAPE EFFECT */}
          <View style={styles.illustrationFlowContainer}>
            {/* Background layer: Cityscape sits behind the wave */}
            <View style={styles.cityscapeWrapper}>
              <Cityscape />
            </View>

            {/* Foreground layer: Wave overlaps the bottom base of the cityscape */}
            <View style={styles.waveWrapper}>
              <BottomWave />
            </View>

            {/* Terms & Conditions placed over the foreground wave layer */}
            <View style={styles.footerTerms}>
              <Text style={styles.termsText}>By continuing, you agree to our</Text>
              <View style={styles.linksRow}>
                <TouchableOpacity><Text style={styles.link}>Terms of Service </Text></TouchableOpacity>
                <Text style={styles.termsText}>and </Text>
                <TouchableOpacity><Text style={styles.link}>Privacy Policy</Text></TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  // Abstract Top Graphic Accents
  glow: {
    position: "absolute",
    top: -120,
    alignSelf: "center",
    width: width * 1.2,
    height: width * 1.2,
    resizeMode: "contain",
    opacity: 0.9,
    zIndex: 0,
  },
  circle: {
    position: "absolute",
    borderWidth: 1,
    borderColor: "rgba(37,117,252,0.06)",
    borderRadius: 999,
    zIndex: 0,
  },
  circleOne: { width: width * 1.05, height: width * 1.05, top: -width * 0.35, alignSelf: "center" },
  circleTwo: { width: width * 0.82, height: width * 0.82, top: -width * 0.24, alignSelf: "center" },
  circleThree: { width: width * 0.60, height: width * 0.60, top: -width * 0.12, alignSelf: "center" },

  // Scroll Container Core Structure
  scrollContent: {
    flexGrow: 1,
    paddingTop: 30,
  },
  logoSection: {
    alignItems: "center",
    marginTop: 15,
    marginBottom: 10,
  },
  headingSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#12213E",
    marginBottom: 6,
  },
  subText: {
    fontSize: 14,
    color: "#62708A",
  },
  cardContainer: {
    paddingHorizontal: 24,
    width: "100%",
  },

  spacer: {
    flex: 1,
    minHeight: 30,
  },

  // Base illustration bounding box
  illustrationFlowContainer: {
    width: "100%",
    position: "relative",
    marginTop: 40,
    height: width * 0.55,
  },

  // Placed at zIndex 1 (Background layer)
  cityscapeWrapper: {
    position: "absolute",
    bottom: "35%",
    left: 0,
    right: 0,
    zIndex: 1,
  },

  // Placed at zIndex 2 (Overlaps the city bottom base)
  waveWrapper: {
    position: "absolute",
    bottom: "10%",
    left: 0,
    right: 0,
    zIndex: 2,
  },

  // Placed at zIndex 3 (Sits perfectly at the readable baseline over the graphics)
  footerTerms: {
    position: "absolute",
    bottom: Platform.OS === "ios" ? 16 : 24,
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 3,
  },
  termsText: {
    fontSize: 12,
    color: "#62708A",
    fontWeight: "500",
  },
  linksRow: {
    flexDirection: "row",
    marginTop: 3,
    alignItems: "center",
  },
  link: {
    fontSize: 12,
    color: "#2575FC",
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});
