import React, { useEffect } from "react";
import { Image, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from "react-native-reanimated";

const AnimatedImage = Animated.createAnimatedComponent(Image);

export default function BackgroundGlow() {

  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.45);

  useEffect(() => {

    scale.value = withRepeat(
      withSequence(
        withTiming(1.08, {
          duration: 350,
          easing: Easing.out(Easing.ease),
        }),
        withTiming(1, {
          duration: 850,
          easing: Easing.inOut(Easing.ease),
        }),
      ),
      -1,
      false
    );

    opacity.value = withRepeat(
      withSequence(
        withTiming(0.85, { duration: 350 }),
        withTiming(0.45, { duration: 850 }),
      ),
      -1,
      false
    );

  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      {
        scale: scale.value,
      },
    ],
  }));

  return (
    <AnimatedImage
      source={require("../../../assets/splash/glow.png")}
      resizeMode="contain"
      style={[styles.glow, animatedStyle]}
    />
  );

}

const styles = StyleSheet.create({

  glow: {
    width: 300,
    height: 140,
    position: "absolute",
  },

});