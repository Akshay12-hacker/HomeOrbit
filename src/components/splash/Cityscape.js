import React from "react";
import { View, Image, Dimensions, StyleSheet } from "react-native";

const { width } = Dimensions.get("window");

export default function Cityscape() {
  return (
    <View style={styles.container}>
      <Image
        source={require("../../../assets/splash/cityscape.png")}
        style={styles.image}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
  },
  image: {
    width: width,
    // Maintains the natural aspect ratio of the vector graphic (~650x413)
    height: width * 0.635, 
    resizeMode: "contain", // Changed from 'cover' to prevent cropping on wider screens
  },
});