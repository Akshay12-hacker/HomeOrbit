import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeContext';
import { scale, verticalScale, moderateScale } from '../../utils/responsive';
import { spacing, radius, shadows } from '../../theme';
import { Button } from '../../components/ui';
import NotificationItem from '../../components/notifications/NotificationItem';
import notificationService from '../../services/notifications/notificationService';

export default function NotificationScreen({ navigation }) {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [notifications, setNotifications] = useState(notificationService.getNotifications());

  useEffect(() => {
    const unsubscribe = notificationService.addListener((updatedList) => {
      setNotifications(updatedList);
    });
    return unsubscribe;
  }, []);

  const handleNotificationPress = (notif) => {
    notificationService.markAsRead(notif.id);
    // Navigate based on data or type
  };

  const handleClearAll = () => {
    notificationService.clearAll();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" translucent />
      
      <LinearGradient
        colors={colors.gradientHero}
        style={[styles.header, { paddingTop: insets.top + 20 }]}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notifications</Text>
          <TouchableOpacity onPress={handleClearAll}>
            <Text style={styles.clearText}>Clear All</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <NotificationItem 
            item={item} 
            onPress={handleNotificationPress} 
          />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🔔</Text>
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No notifications yet</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
              We'll notify you about payments, announcements, and important updates.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingBottom: verticalScale(20),
    borderBottomLeftRadius: radius.xxl,
    borderBottomRightRadius: radius.xxl,
    ...shadows.md,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(20),
  },
  headerTitle: {
    fontSize: moderateScale(20),
    fontWeight: '900',
    color: '#fff',
  },
  backBtn: {
    width: scale(40),
    height: scale(40),
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: moderateScale(24),
    color: '#fff',
  },
  clearText: {
    fontSize: moderateScale(13),
    fontWeight: '700',
    color: 'rgba(255,255,255,0.8)',
  },
  listContent: {
    padding: scale(20),
    paddingBottom: verticalScale(100),
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: verticalScale(100),
    paddingHorizontal: scale(40),
  },
  emptyIcon: {
    fontSize: moderateScale(64),
    marginBottom: verticalScale(20),
    opacity: 0.2,
  },
  emptyTitle: {
    fontSize: moderateScale(18),
    fontWeight: '800',
    marginBottom: verticalScale(8),
  },
  emptySubtitle: {
    fontSize: moderateScale(14),
    textAlign: 'center',
    lineHeight: moderateScale(20),
  },
});
