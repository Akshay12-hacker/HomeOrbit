import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
  Dimensions,
  Modal,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  Easing
} from 'react-native-reanimated';

import {
  shadows,
  spacing,
  radius,
  typography,
} from '../../theme';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../hooks/useAuth';
import LogoutModal from '../modals/LogoutModal';
import { logout } from '../../services/auth/logout';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SIDEBAR_WIDTH = SCREEN_WIDTH * 0.82;

const MAIN_CONTROLS = [
  { icon: '🏠', title: 'Home', route: 'Home' },
  { icon: '🛠️', title: 'My Maintenance', route: 'Maintenance' },
  { icon: '🏦', title: 'Society Fund', route: 'SocietyFund' },
  { icon: '👤', title: 'My Profile', route: 'Profile' },
  { icon: '⚙️', title: 'Settings', route: 'Settings' },
];

const ADMIN_CONTROLS = [
  { icon: '💎', title: 'Plan & Billing', route: 'Subscription' },
  { icon: '💵', title: 'Collect Maintenance', route: 'CollectMaintenance' },
  { icon: '📝', title: 'Create Maintenance', route: 'CreateMaintenance' },
  { icon: '👥', title: 'Approve Members', route: 'ApproveReject' },
  { icon: '📢', title: 'Create Notice', route: 'CreateNotice' },
];

function MenuItem({
  item,
  onPress,
  colors,
  danger,
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => onPress?.(item)}
      style={[styles.menuItem, { backgroundColor: colors.isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }]}
    >
      <View style={[styles.menuIconWrap, { backgroundColor: danger ? 'rgba(239,68,68,0.1)' : (colors.isDark ? 'rgba(99,102,241,0.15)' : 'rgba(79, 70, 229, 0.08)') }]}>
        <Text style={styles.menuIconText}>
          {item.icon}
        </Text>
      </View>

      <Text style={[styles.menuText, { color: danger ? colors.error : colors.textPrimary }]}>
        {item.title}
      </Text>

      <Text style={[styles.chevron, { color: colors.textMuted }]}>
        ›
      </Text>
    </TouchableOpacity>
  );
}

function SectionHeader({ title, colors }) {
  return (
    <View style={styles.sectionHeader}>
       <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>{title}</Text>
       <View style={[styles.sectionLine, { backgroundColor: colors.divider }]} />
    </View>
  );
}

export default function SidebarMenu({
  visible,
  onClose,
  navigation,
}) {
  const { colors, isDark } = useTheme();
  const { user, selectedProfile } = useAuth();
  const [showLogout, setShowLogout] = useState(false);
  
  const isAdmin = selectedProfile?.role === 'admin' || user?.roles?.includes('Admin');
  
  const translateX = useSharedValue(-SIDEBAR_WIDTH);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateX.value = withTiming(0, { 
        duration: 300, 
        easing: Easing.bezier(0.25, 0.1, 0.25, 1)
      });
      opacity.value = withTiming(1, { duration: 300 });
    } else {
      translateX.value = withTiming(-SIDEBAR_WIDTH, { duration: 250 });
      opacity.value = withTiming(0, { duration: 250 });
    }
  }, [visible]);

  const sidebarStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const handleNavigate = React.useCallback(
    (item) => {
      translateX.value = withTiming(-SIDEBAR_WIDTH, { duration: 200 });
      opacity.value = withTiming(0, { duration: 200 });
      
      setTimeout(() => {
        onClose?.();
        navigation?.navigate(item.route);
      }, 250);
    },
    [navigation, onClose]
  );

  const handleLogoutPress = () => {
    setShowLogout(true);
  };

  const confirmLogout = async () => {
    setShowLogout(false);
    onClose?.();
    await logout();
    navigation?.getParent()?.getParent()?.reset({
      index: 0,
      routes: [{ name: 'Auth' }],
    });
  };

  const displayName = selectedProfile?.ownerName || selectedProfile?.OwnerName || user?.name || 'Resident';
  const initial = String(displayName).charAt(0).toUpperCase();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View style={[styles.backdrop, { backgroundColor: colors.overlay }, backdropStyle]}>
           <TouchableOpacity activeOpacity={1} onPress={onClose} style={{ flex: 1 }} />
        </Animated.View>

        <Animated.View style={[styles.sidebar, { backgroundColor: colors.background }, sidebarStyle]}>
          <LinearGradient
            colors={colors.gradientHero}
            style={styles.header}
          >
            <View style={styles.headerTop}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initial}</Text>
              </View>
              <TouchableOpacity
                onPress={onClose}
                style={styles.closeBtn}
              >
                <Text style={styles.closeIcon}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.profileInfo}>
              <Text style={styles.userName} numberOfLines={1}>
                {displayName}
              </Text>
              <Text style={styles.societyName} numberOfLines={1}>
                {selectedProfile?.societyName || 'Home Orbit Society'}
              </Text>
            </View>
          </LinearGradient>

          <ScrollView 
            style={styles.menuList} 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
          >
            <SectionHeader title="MAIN CONTROLS" colors={colors} />
            {MAIN_CONTROLS.map((item) => (
              <MenuItem
                key={item.title}
                item={item}
                onPress={handleNavigate}
                colors={colors}
              />
            ))}

            {isAdmin && (
              <>
                <SectionHeader title="ADMIN CONTROLS" colors={colors} />
                {ADMIN_CONTROLS.map((item) => (
                  <MenuItem
                    key={item.title}
                    item={item}
                    onPress={handleNavigate}
                    colors={colors}
                  />
                ))}
              </>
            )}
            
            <View style={{ height: 20 }} />
            
            <MenuItem
              item={{ icon: '🚪', title: 'Logout' }}
              onPress={handleLogoutPress}
              colors={colors}
              danger
            />
          </ScrollView>

          <View style={[styles.footer, { borderTopColor: colors.border }]}>
            <View style={styles.footerBrand}>
              <View style={[styles.brandDot, { backgroundColor: colors.primary }]} />
              <Text style={[styles.footerText, { color: colors.textPrimary }]}>
                HomeOrbit <Text style={{ fontWeight: '400', color: colors.textMuted }}>v1.0.4</Text>
              </Text>
            </View>
          </View>
        </Animated.View>

        <LogoutModal 
          visible={showLogout}
          onClose={() => setShowLogout(false)}
          onConfirm={confirmLogout}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sidebar: {
    width: SIDEBAR_WIDTH,
    height: '100%',
    ...shadows.lg,
    borderTopRightRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 64 : 48,
    paddingHorizontal: 24,
    paddingBottom: 36,
    borderBottomRightRadius: 32,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarText: {
    fontSize: 26,
    fontWeight: '900',
    color: '#fff',
  },
  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  profileInfo: {
    marginTop: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -0.5,
  },
  societyName: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 6,
    fontWeight: '600',
  },
  menuList: {
    flex: 1,
    paddingTop: 24,
    paddingHorizontal: 18,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  sectionLine: {
    flex: 1,
    height: 1,
    marginLeft: 12,
    opacity: 0.5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 18,
    marginBottom: 8,
  },
  menuIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  menuIconText: {
    fontSize: 20,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
  },
  chevron: {
    fontSize: 20,
    fontWeight: '300',
    opacity: 0.4,
  },
  footer: {
    padding: 28,
    borderTopWidth: 1,
  },
  footerBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  footerText: {
    fontSize: 14,
    fontWeight: '800',
  },
});
