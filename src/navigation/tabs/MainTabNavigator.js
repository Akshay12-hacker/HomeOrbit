import React from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { useTheme } from '../../theme/ThemeContext';
import { useScroll } from '../../theme/ScrollContext';
import Animated, { 
  useAnimatedStyle, 
  withTiming, 
  useSharedValue,
} from 'react-native-reanimated';

import HomeScreen from '../../screens/home/HomeScreen';
import MaintenanceScreen from '../../screens/maintenance/MaintenanceScreen';
import HistoryScreen from '../../screens/payments/HistoryScreen';
import ProfileScreen from '../../screens/profile/ProfileScreen';

const Tab = createBottomTabNavigator();

const tabs = {
  Home: '🏠',
  Maintenance: '🛠️',
  History: '📜',
  Profile: '👤',
};

function CustomTabBar({
  state,
  navigation,
}) {
  const { colors, isDark } = useTheme();
  const { tabBarVisible } = useScroll();

  const translateY = useSharedValue(0);

  React.useEffect(() => {
    translateY.value = withTiming(tabBarVisible ? 0 : 150, { duration: 350 });
  }, [tabBarVisible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  // Theme-aware styles
  const barBg = isDark ? 'rgba(15, 23, 42, 0.85)' : 'rgba(248, 247, 242, 0.85)';
  const activeTabBg = isDark ? 'rgba(99, 102, 241, 0.15)' : 'rgba(79, 70, 229, 0.08)';
  const borderCol = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';

  return (
    <Animated.View style={[styles.wrapper, animatedStyle]}>
      <BlurView intensity={isDark ? 30 : 50} tint={isDark ? 'dark' : 'light'} style={[styles.bar, { backgroundColor: barBg, borderColor: borderCol }]}>
        {state.routes.map(
          (route, index) => {
            const isFocused = state.index === index;
            const label = route.name;
            const icon = tabs[route.name];

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            return (
              <TouchableOpacity
                key={route.key}
                activeOpacity={0.7}
                onPress={onPress}
                style={[
                  styles.tab,
                  isFocused && { backgroundColor: activeTabBg },
                ]}
              >
                <Text
                  style={[
                    styles.icon,
                    { color: isFocused ? colors.primary : colors.textMuted },
                  ]}
                >
                  {icon}
                </Text>
                <Text style={[styles.navLbl, { color: isFocused ? colors.primary : colors.textMuted }]}>{label}</Text>
              </TouchableOpacity>
            );
          }
        )}
      </BlurView>
    </Animated.View>
  );
}

export default function MainTabNavigator({
  route,
}) {
  const tabParams = route?.params || {};

  return (
    <Tab.Navigator
      tabBar={(props) => (
        <CustomTabBar {...props} />
      )}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        initialParams={tabParams}
      />
      <Tab.Screen
        name="Maintenance"
        component={MaintenanceScreen}
        initialParams={tabParams}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        initialParams={tabParams}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        initialParams={tabParams}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: Platform.OS === 'ios' ? 40 : 30,
    zIndex: 100,
  },
  bar: {
    flexDirection: 'row',
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 12,
    borderWidth: 1.5,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
      },
      android: {
        elevation: 10,
      },
    })
  },
  tab: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 24,
  },
  icon: {
    fontSize: 20,
  },
  navLbl: {
    fontSize: 10,
    fontWeight: '800',
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
