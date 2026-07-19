import React from 'react';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import AnimatedLogo from '../../components/splash/AnimatedLogo';
import Cityscape from '../../components/splash/Cityscape';
import BottomWave from '../../components/splash/BottomWave';
import { Dimensions } from "react-native";

const { width } = Dimensions.get("window");
export default function SplashScreen() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        {/* Top Background Orbit Rings Ring Decor */}
        <View style={styles.circleBackdrop} />
          {/* Center Content Group */}
        <View style={styles.centerContent}>
    <AnimatedLogo />
</View>

        {/* Graphic Bottom Layers */}
        <Cityscape />
        
        <BottomWave />

        {/* Spinner & Active Action Statement */}
        <View style={styles.footerContainer}>
          <ActivityIndicator size="large" color="#00f2fe" style={{ marginBottom: 8 }} />
          <Text style={styles.loadingText}>Loading your community...</Text>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  circleBackdrop: {
    position: "absolute",
    top: -width * 0.25,
    width: width * 1.2,
    height: width * 1.2,
    borderRadius: width,
    borderWidth: 1,
    borderColor: "rgba(37,117,252,0.05)",
},
  centerContent: {
  flex: 1,
  width: "100%",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 2,
  overflow: "visible",
},
  brandTitle: {
    fontSize: 42,
    fontWeight: '700',
    color: '#0B2545',
    letterSpacing: -0.5,
    marginTop: 20,
  },
  brandAccent: {
    color: '#2575FC',
  },
  taglineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingHorizontal: 40,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E6ED',
  },
  taglineText: {
    fontSize: 14,
    color: '#657786',
    marginHorizontal: 10,
    fontWeight: '500',
  },
  taglineHighlight: {
    color: '#00F2FE',
    fontWeight: '600',
  },
  footerContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  loadingText: {
    fontSize: 13,
    color: '#134074',
    fontWeight: '500',
    opacity: 0.8,
  },
});