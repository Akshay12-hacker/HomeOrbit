import React, { useEffect } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from "react-native-reanimated";

const { width } = Dimensions.get("window");

export default function BottomWave() {
  const waveX = useSharedValue(0);

  useEffect(() => {
    // A subtle, single horizontal bobbing effect to keep it elegant and fluid
    waveX.value = withRepeat(
      withSequence(
        withTiming(-12, {
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
        }),
        withTiming(12, {
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
        })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: waveX.value }],
  }));

  return (
    <View style={styles.container}>
      <Animated.Image
        source={require("../../../assets/splash/bottom-wave.png")}
        style={[styles.waveImage, animatedStyle]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: width,
    // Natural height dynamic based on the image aspect ratio
    height: width * 0.44, 
    overflow: "hidden",
    alignItems: "center",
  },
  waveImage: {
    // Sized slightly wider so the edges stay hidden during animation drift
    width: width + 30,
    height: "100%",
    resizeMode: "stretch",
  },
});