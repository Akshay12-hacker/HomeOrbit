import React from "react";
import { View, Image, Dimensions, StyleSheet } from "react-native";

const { width } = Dimensions.get("window");

export default function AnimatedLogo({ size, style }) {
  // Balanced responsive width matching the UI design layout
  const logoWidth = size || Math.min(width * 0.7, 300);
  
  // Calculate height based on the asset aspect ratio (approx 3:2 layout)
  const logoHeight = logoWidth * 0.7; 

  return (
    <View
      style={[
        {
          width: logoWidth,
          height: logoHeight,
          justifyContent: "center",
          alignItems: "center",
        },
        style,
      ]}
    >
      <Image
        source={require("../../../assets/splash/logo.png")}
        style={styles.logoImage}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  logoImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
});