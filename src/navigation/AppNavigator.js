import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';
import { COLORS, RADIUS, SHADOW, FONTS } from '../theme';

import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import OTPScreen from '../screens/OTPScreen';
import SocietyScreen from '../screens/SocietyScreen';
import HomeScreen from '../screens/HomeScreen';
import MaintenanceScreen from '../screens/MaintenanceScreen';
import HistoryScreen from '../screens/HistoryScreen';
import ReceiptScreen from '../screens/ReceiptScreen';
import AdminExpenseScreen from '../screens/AdminExpenseScreen';
import SocietyFundScreen from '../screens/SocietyFundScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TAB_ICONS = {
  Home:        { emoji: '🏠', label: 'Home' },
  Maintenance: { emoji: '🧾', label: 'Due' },
  History:     { emoji: '📋', label: 'History' },
};

const CustomTabBar = ({ state, navigation }) => {
  const { width } = useWindowDimensions();
  const isWide = width >= 768;

  return (
  <View style={[tabStyles.outer, isWide && tabStyles.outerWide]}>
    <View style={[tabStyles.bar, isWide && tabStyles.barWide]}>
    {state.routes.map((route, index) => {
      const focused = state.index === index;
      const tab = TAB_ICONS[route.name];
      return (
        <TouchableOpacity key={route.key} onPress={() => navigation.navigate(route.name)} activeOpacity={0.75} style={[tabStyles.tab, isWide && tabStyles.tabWide]}>
          <View style={[tabStyles.iconWrap, focused && tabStyles.iconWrapActive]}>
            <Text style={{ fontSize: focused ? 20 : 18 }}>{tab.emoji}</Text>
          </View>
          <Text style={[tabStyles.label, focused && tabStyles.labelActive]}>{tab.label}</Text>
          {focused && <View style={tabStyles.dot} />}
        </TouchableOpacity>
      );
    })}
    </View>
  </View>
  );
};

function MainTabs({ route }) {
  const params = route.params || {};
  const role = params.role || 'user';
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: COLORS.navy },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '800', fontSize: FONTS.sizes.md },
        headerShadowVisible: false,
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} initialParams={params}
        options={{ headerTitle: '🏠  Home Orbit',
          headerRight: () => <TouchableOpacity style={{ marginRight: 16 }}><Text style={{ fontSize: 20 }}>🔔</Text></TouchableOpacity>,
        }}
      />
      <Tab.Screen name="Maintenance" component={MaintenanceScreen} options={{ headerTitle: '🧾  Maintenance Due' }} />
      <Tab.Screen name="History" component={HistoryScreen} options={{ headerTitle: '📋  Payment History' }} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        <Stack.Screen name="Splash" component={SplashScreen} options={{ animation: 'fade' }} />
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ animation: 'slide_from_right', animationTypeForReplace: 'push' }}
        />
        <Stack.Screen name="OTP" component={OTPScreen} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="Society" component={SocietyScreen} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="Main" component={MainTabs} options={{ animation: 'fade' }} />
        {/* Modal screens (accessible from any tab) */}
        <Stack.Screen name="Receipt" component={ReceiptScreen}
          options={{ headerShown: true, headerTitle: '🧾  Receipt', headerStyle: { backgroundColor: COLORS.navy }, headerTintColor: '#fff', headerTitleStyle: { fontWeight: '800' }, animation: 'slide_from_bottom', presentation: 'modal' }}
        />
        <Stack.Screen name="AdminExpense" component={AdminExpenseScreen}
          options={{ headerShown: true, headerTitle: '🏦  Society Fund', headerStyle: { backgroundColor: COLORS.navy }, headerTintColor: '#fff', headerTitleStyle: { fontWeight: '800' }, animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="SocietyFund"
          component={SocietyFundScreen}
          options={{
            headerShown: true,
            headerTitle: '🏦  Fund Expense History',
            headerStyle: { backgroundColor: COLORS.navy },
            headerTintColor: '#fff',
            headerTitleStyle: { fontWeight: '800' },
            animation: 'slide_from_right',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const tabStyles = StyleSheet.create({
  outer: { backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: COLORS.border },
  outerWide: { alignItems: 'center' },
  bar: { flexDirection: 'row', backgroundColor: '#fff', paddingBottom: 8, paddingTop: 6, paddingHorizontal: 16, ...SHADOW.strong },
  barWide: { width: '100%', maxWidth: 760, paddingHorizontal: 24 },
  tab: { flex: 1, alignItems: 'center', gap: 3 },
  tabWide: { maxWidth: 160 },
  iconWrap: { width: 40, height: 32, borderRadius: RADIUS.sm, alignItems: 'center', justifyContent: 'center' },
  iconWrapActive: { backgroundColor: COLORS.bluePale },
  label: { fontSize: 10, fontWeight: '600', color: COLORS.textMuted },
  labelActive: { color: COLORS.blue, fontWeight: '800' },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: COLORS.blue },
});
