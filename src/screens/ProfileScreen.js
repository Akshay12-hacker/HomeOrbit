import React from 'react';
import { ScrollView, StyleSheet, Text,Alert } from 'react-native';

import { Card, Button } from '../components/ui';
import ProfileHeader from '../components/profile/ProfileHeader';
import InfoRow from '../components/profile/InfoRow';
import SubscriptionCard from '../components/profile/SubscriptionCard';
import ActionButton from '../components/profile/ActionButton';

import { COLORS, SPACING, RADIUS } from '../theme';

export default function ProfileScreen({ route, navigation }) {
  const role = route.params?.role || 'user';

  const user = route.params?.user || {};

  const society = route.params?.society?.name || 'Unknown Society';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      {/* HEADER */}
      <ProfileHeader
        name={user?.name || 'Resident'}
        role={role}
        society={society}
      />

      {/* PERSONAL INFO */}
      <Card noPad style={styles.card}>
        <Text style={styles.sectionTitle}>
          Personal Information
        </Text>

        <InfoRow
          icon="📞"
          label="Phone"
          value={user?.phone || '-'}
        />

        <InfoRow
          icon="📧"
          label="Email"
          value={user?.email || 'Not Added'}
        />

        <InfoRow
          icon="🏠"
          label="Plot"
          value="Plot 101"
        />

        <InfoRow
          icon="📅"
          label="Member Since"
          value="2026"
          last
        />
      </Card>

      {/* SOCIETY INFO */}
      <Card noPad style={styles.card}>
        <Text style={styles.sectionTitle}>
          Society Membership
        </Text>

        <InfoRow
          icon="🏢"
          label="Society"
          value={society}
        />

        <InfoRow
          icon="🪽"
          label="Wing"
          value="A Wing"
        />

        <InfoRow
          icon="👤"
          label="Resident Type"
          value="Owner"
          last
        />
      </Card>

      {/* SUBSCRIPTION */}
      <SubscriptionCard navigation={navigation} />

      {/* ACTIONS */}
      <Card noPad style={styles.card}>
  <Text style={styles.sectionTitle}>

    Account Actions
  </Text>
  <ActionButton
    icon="✏️"
    title="Edit Profile"
    subtitle="Update your account information"
    onPress={() => {}}
  />

  <ActionButton
    icon="💳"
    title="Manage Subscription"
    subtitle="View or change your current plan"
    onPress={() => navigation.navigate('Subscription')}
  />

  <ActionButton
    icon="❓"
    title="Help & Support"
    subtitle="Get help regarding your account"
    onPress={() => {}}
  />

  <ActionButton
  icon="🚪"
  title="Logout"
  subtitle="Sign out from your account"
  danger
  last
  onPress={() =>
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () =>
            navigation.replace('Login'),
        },
      ]
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

  card: {
    marginBottom: SPACING.lg,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.textPrimary,
    padding: SPACING.base,
    paddingBottom: 10,
  },
});