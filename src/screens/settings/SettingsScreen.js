import React from 'react';

import {
  ScrollView,
  StyleSheet,
  Text,
  Alert,
  Platform,
} from 'react-native';

import { Card } from '../../components/ui';

import ActionButton from '../../components/profile/ActionButton';

import {
  colors as themeColors,
  spacing,
  radius,
} from '../../theme';
import { useTheme } from '../../theme/ThemeContext';
import { Switch, View as RNView } from 'react-native';

export default function SettingsScreen({
  navigation,
}) {
  const { isDark, toggleTheme, colors } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },

    content: {
      padding: spacing.lg,
      paddingBottom: 120,
    },

    title: {
      fontSize: 28,
      fontWeight: '900',
      color: colors.textPrimary,
      marginBottom: 4,
      marginTop: 20,
    },

    subtitle: {
      fontSize: 14,
      color: colors.textMuted,
      marginBottom: spacing.lg,
      lineHeight: 20,
    },

    card: {
      overflow: 'hidden',
      borderRadius: 20,
      marginBottom: spacing.lg,
    },

    sectionTitle: {
      fontSize: 16,
      fontWeight: '800',
      color: colors.textPrimary,
      padding: spacing.lg,
      paddingBottom: 10,
    },
  });

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* HEADER */}
      <Text style={[styles.title, { color: colors.textPrimary }]}>
        Settings
      </Text>

      <Text style={[styles.subtitle, { color: colors.textMuted }]}>
        Manage your app preferences and support options.
      </Text>

      {/* DISPLAY */}
      <Card noPad style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          Display
        </Text>

        <RNView style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.md }}>
          <RNView>
            <Text style={{ fontSize: 16, fontWeight: '600', color: colors.textPrimary }}>Dark Mode</Text>
            <Text style={{ fontSize: 12, color: colors.textMuted }}>Enjoy a darker color scheme</Text>
          </RNView>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: '#767577', true: colors.primary }}
            thumbColor={Platform.OS === 'ios' ? '#fff' : isDark ? colors.accent : '#f4f3f4'}
          />
        </RNView>
      </Card>

      {/* PREFERENCES */}
      <Card noPad style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
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