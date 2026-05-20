import React from 'react';
import { View, Text, StyleSheet,TouchableOpacity } from 'react-native';
import { Badge } from '../ui';
import { COLORS, SPACING, RADIUS } from '../../theme';

export default function ProfileHeader({
  name,
  role,
  society,
}) {
  const initials = name?.charAt(0)?.toUpperCase() || 'U';

  return (
    <View style={styles.container}>
  <View style={styles.left}>
    <View style={styles.avatar}>
      <Text style={styles.avatarText}>
        {initials}
      </Text>
    </View>

    <View style={styles.info}>
      <View style={styles.topRow}>
        <Text style={styles.name}>
          {name}
        </Text>

        <Badge
          label={role === 'admin' ? 'Admin' : 'Resident'}
          type="info"
        />
      </View>

      <Text style={styles.society}>
        {society}
      </Text>
    </View>
  </View>
</View>
  );
}

const styles = StyleSheet.create({
    left: {
  flexDirection: 'row',
  alignItems: 'center',
  flex: 1,
},
  container: {
    flexDirection: 'row',
    alignItems: 'center',

    backgroundColor: COLORS.white,

    borderRadius: RADIUS.lg,

    padding: SPACING.base,

    marginBottom: SPACING.lg,

    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },

  avatar: {
    width: 58,
    height: 58,

    borderRadius: 29,

    backgroundColor: COLORS.navy,

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 14,
  },

  avatarText: {
    color: COLORS.accent,

    fontSize: 22,

    fontWeight: '900',
  },

  info: {
    flex: 1,
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  name: {
    fontSize: 18,

    fontWeight: '800',

    color: COLORS.textPrimary,
  },

  society: {
    marginTop: 4,

    fontSize: 13,

    color: COLORS.textMuted,
  },
});