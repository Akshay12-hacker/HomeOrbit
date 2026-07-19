import React from "react";
import { View, StyleSheet, Text } from "react-native";

import Logo from "../../../assets/splash/logo.svg";
import Orbit from "../../../assets/splash/orbit.svg";

export default function LogoSection() {
  return (
    <View style={styles.container}>

      <View style={styles.iconContainer}>

        <Orbit
          width="100%"
          height="100%"
        />

        <View style={styles.logoWrapper}>
          <Logo
            width={110}
            height={110}
          />
        </View>

      </View>

      <Text style={styles.title}>
        HomeOrbit
      </Text>

      <Text style={styles.subtitle}>
        Manage. Collect. Elevate.
      </Text>

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    alignItems: "center",
  },

  iconContainer: {
    width: 260,
    height: 260,
    justifyContent: "center",
    alignItems: "center",
  },

  logoWrapper: {
    position: "absolute",
  },

  title: {
    marginTop: 20,
    fontSize: 42,
    fontWeight: "700",
    color: "#0B1F44",
  },

  subtitle: {
    marginTop: 10,
    fontSize: 16,
    color: "#64748B",
    fontWeight: "500",
  },

});