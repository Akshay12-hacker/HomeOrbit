import React, {
  useState,
} from 'react';
import { ScrollView, StyleSheet, Text,Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { Card, Button } from '../../components/ui';
import ProfileHeader from '../../components/profile/ProfileHeader';
import InfoRow from '../../components/profile/InfoRow';
import SubscriptionCard from '../../components/profile/SubscriptionCard';
import ActionButton from '../../components/profile/ActionButton';
import LogoutModal from '../../components/profile/LogoutModal';
import { getCurrentActivePlan } from '../../services/payments/api/getCurrentActivePlan';
import { logout } from '../../services/auth/logout';
import { useAuth } from '../../hooks/useAuth';
import { colors as themeColors, radius, spacing, typography } from '../../theme';
import { useTheme } from '../../theme/ThemeContext';

export default function ProfileScreen({ navigation }) {
  const { colors } = useTheme();
  const { user: storeUser, selectedProfile, selectedUnit } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = async () => {
    setShowLogoutModal(false);
    await logout();

    navigation
      .getParent()
      ?.getParent()
      ?.reset({
        index: 0,
        routes: [
          {
            name: 'Auth',
          },
        ],
      });
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },

    content: {
      padding: spacing.lg,
      paddingBottom: 120,
    },

    card: {
      marginBottom: 20,
      borderRadius: 20,
      overflow: 'hidden',
    },

    sectionTitle: {
      fontSize: 16,
      fontWeight: '800',
      color: colors.textPrimary,
      padding: spacing.lg,
      paddingBottom: 10,
    },
  });

  const user = storeUser || {};
  const society = selectedProfile?.societyName || 'Unknown Society';
  const role = selectedProfile?.role || 'user';
  const plotName = selectedUnit?.unitName || 'No Plot';

  // Better data fallbacks for display
  const displayName = selectedProfile?.ownerName || selectedProfile?.OwnerName || user?.name || 'Resident';
  const displayPhone = user?.phone || selectedProfile?.ownerPhone || selectedProfile?.OwnerPhone || '-';

  const [
  activePlan,
  setActivePlan,
] = useState(null);

const [
  activePlanLoading,
  setActivePlanLoading,
] = useState(true);

const [
activePlanError,
setActivePlanError,
] = useState('');

useFocusEffect(
  React.useCallback(() => {
    loadSubscription();
  }, [])
);

const loadSubscription =  async () => {
    try {
      setActivePlanLoading(true);

      setActivePlanError('');

      const response =
        await getCurrentActivePlan();

      setActivePlan(response);
    } catch (error) {
      setActivePlanError(
        error?.message ||
          'Failed to load subscription.'
      );
    } finally {
      setActivePlanLoading(false);
    }
  };
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      {/* HEADER */}
      <ProfileHeader
        name={displayName}
        role={role}
        society={society}
      />

      {/* PERSONAL INFO */}
      <Card noPad style={styles.card}>
        <Text style={styles.sectionTitle}>
          Personal Information
        </Text>

        <InfoRow
          icon="P"
          label="Phone"
          value={displayPhone}
        />

        <InfoRow
          icon="E"
          label="Email"
          value={user?.email || 'Not Added'}
        />

        <InfoRow
          icon="U"
          label="Plot"
          value={plotName}
        />

        <InfoRow
          icon="Y"
          label="Member Since"
          value={user?.createdAt ? new Date(user.createdAt).getFullYear().toString() : new Date().getFullYear().toString()}
          last
        />
      </Card>

      {/* SOCIETY INFO */}
      <Card noPad style={styles.card}>
        <Text style={styles.sectionTitle}>
          Society Membership
        </Text>

        <InfoRow
          icon="S"
          label="Society"
          value={society}
        />

        <InfoRow
          icon="W"
          label="Wing"
          value={selectedUnit?.wingName || '-'}
        />

        <InfoRow
          icon="O"
          label="Resident Type"
          value={selectedProfile?.residentType || 'Owner'}
          last
        />
      </Card>

      {/* SUBSCRIPTION */}
      <SubscriptionCard
  navigation={navigation}
  plan={activePlan}
  isScheduled={
    activePlan?.status ===
    'SCHEDULED'
  }
  loading={activePlanLoading}
  error={activePlanError}
/>

      {/* ACTIONS */}
      <Card noPad style={styles.card}>
  <Text style={styles.sectionTitle}>

    Account Actions
  </Text>
  <ActionButton
    icon="E"
    title="Edit Profile"
    subtitle="Update your account information"
    onPress={() => {}}
  />

  <ActionButton
    icon="S"
    title="Manage Subscription"
    subtitle="View or change your current plan"
    onPress={() => navigation.navigate('Subscription')}
  />

  <ActionButton
    icon="H"
    title="Help & Support"
    subtitle="Get help regarding your account"
    onPress={() => {}}
  />

  <ActionButton
  icon="L"
  title="Logout"
  subtitle="Sign out from your account"
  danger
  last
  onPress={() => setShowLogoutModal(true)}
/>
</Card>

    <LogoutModal 
      visible={showLogoutModal} 
      onClose={() => setShowLogoutModal(false)}
      onConfirm={handleLogout}
    />
    </ScrollView>
  );
}

