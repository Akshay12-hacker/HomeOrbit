import React from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { Badge } from '../ui';

import {
  colors,
  radius,
  shadows,
  spacing,
  typography,
} from '../../theme';

export default function ProfileHeader({
  name,
  role,
  society,
}) {
  const initials = name?.charAt(0)?.toUpperCase() || 'U';

  return (
    <LinearGradient
      colors={colors.gradientHero}
      style={styles.container}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {initials}
        </Text>
      </View>

      <View style={styles.info}>
        <View style={styles.topRow}>
          <Text
            style={styles.name}
            numberOfLines={1}
          >
            {name}
          </Text>

          <View style={styles.roleBadge}>
             <Text style={styles.roleText}>{role === 'admin' ? 'Admin' : 'Resident'}</Text>
          </View>
        </View>

        <Text
          style={styles.society}
          numberOfLines={2}
        >
          {society}
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    padding: 10,
    marginBottom: 20,
    top: 20,
    ...shadows.md,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
  },
  info: {
    flex: 1,
    minWidth: 0,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    flex: 1,
  },
  roleBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
    textTransform: 'uppercase',
  },
  society: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 6,
  },
});
