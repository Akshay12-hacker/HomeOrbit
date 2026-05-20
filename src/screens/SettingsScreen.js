import React from 'react';

import {
  ScrollView,
  StyleSheet,
  Text,
  Alert,
} from 'react-native';

import { Card } from '../components/ui';

import ActionButton from '../components/profile/ActionButton';

import {
  COLORS,
  SPACING,
  RADIUS,
} from '../theme';

export default function SettingsScreen({
  navigation,
}) {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      {/* HEADER */}
      <Text style={styles.title}>
        Settings
      </Text>

      <Text style={styles.subtitle}>
        Manage your app preferences and support options.
      </Text>

      {/* PREFERENCES */}
      <Card noPad style={styles.card}>
        <Text style={styles.sectionTitle}>
          Preferences
        </Text>

        <ActionButton
          icon="🔔"
          title="Notifications"
          subtitle="Manage push notifications"
          onPress={() =>
            Alert.alert(
              'Notifications',
              'Notification settings coming soon.'
            )
          }
        />

        <ActionButton
          icon="💸"
          title="Payment Reminders"
          subtitle="Enable or disable reminders"
          onPress={() =>
            Alert.alert(
              'Payment Reminders',
              'Reminder settings coming soon.'
            )
          }
        />

        <ActionButton
          icon="🌐"
          title="Language"
          subtitle="English"
          last
          onPress={() =>
            Alert.alert(
              'Language',
              'Language settings coming soon.'
            )
          }
        />
      </Card>

      {/* SUPPORT */}
      <Card noPad style={styles.card}>
        <Text style={styles.sectionTitle}>
          Support
        </Text>

        <ActionButton
          icon="❓"
          title="Help Center"
          subtitle="Get support and help"
          onPress={() =>
            Alert.alert(
              'Help Center',
              'Support center coming soon.'
            )
          }
        />

        <ActionButton
          icon="🔒"
          title="Privacy Policy"
          subtitle="Read our privacy policy"
          onPress={() =>
            Alert.alert(
              'Privacy Policy',
              'Privacy policy page coming soon.'
            )
          }
        />

        <ActionButton
          icon="📄"
          title="Terms & Conditions"
          subtitle="View terms and conditions"
          last
          onPress={() =>
            Alert.alert(
              'Terms & Conditions',
              'Terms page coming soon.'
            )
          }
        />
      </Card>

      {/* ABOUT */}
      <Card noPad style={styles.card}>
        <Text style={styles.sectionTitle}>
          About
        </Text>

        <ActionButton
          icon="📱"
          title="App Version"
          subtitle="HomeOrbit v1.0.0"
          last
          onPress={() =>
            Alert.alert(
              'HomeOrbit',
              'Version 1.0.0'
            )
          }
        />
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },

  content: {
    padding: SPACING.lg,
    paddingBottom: 120,
  },

  title: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },

  subtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginBottom: SPACING.lg,
    lineHeight: 20,
  },

  card: {
    overflow: 'hidden',
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.lg,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
    padding: SPACING.base,
    paddingBottom: 10,
  },
});