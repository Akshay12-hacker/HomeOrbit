import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';
import { COLORS, FONTS } from '../theme';

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
import SubscriptionScreen from '../screens/SubscriptionScreen';
import CollectMaintenanceScreen from '../screens/CollectMaintenanceScreen';
import CreateMaintenanceScreen from '../screens/CreateMaintenanceScreen';
import ApproveRejectScreen from '../screens/ApproveRejectScreen';
import CreateNoticeScreen from '../screens/CreateNoticeScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TAB_ITEMS = {
  Home: { icon: '🏠', label: 'Home' },
  Maintenance: { icon: '💸', label: 'Due' },
  History: { icon: '📜', label: 'History' },
  Profile: { icon: '👤', label: 'Profile' },
};

const stackHeader = (title, extra = {}) => ({
  headerShown: true,
  headerTitle: title,
  headerStyle: { backgroundColor: COLORS.navy },
  headerTintColor: '#fff',
  headerTitleStyle: { fontWeight: '800' },
  ...extra,
});

const CustomTabBar = ({ state, navigation }) => {
  const { width } = useWindowDimensions();
  const isWide = width >= 768;

  return (
    <View style={[tabStyles.outer, isWide && tabStyles.outerWide]}>
      <View style={[tabStyles.bar, isWide && tabStyles.barWide]}>
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const tab = TAB_ITEMS[route.name];

          return (
            <TouchableOpacity
              key={route.key}
              onPress={() => navigation.navigate(route.name)}
              activeOpacity={0.82}
              accessibilityRole="button"
              accessibilityLabel={tab.label}
              style={[tabStyles.tab, focused && tabStyles.tabActive]}
            >
              <View style={[tabStyles.iconWrap, focused && tabStyles.iconWrapActive]}>
                <Text style={[tabStyles.iconText, focused && tabStyles.iconTextActive]}>
                  {tab.icon}
                </Text>
              </View>
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
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        initialParams={params}
        options={{
          headerTitle: 'Home Orbit',
          headerRight: () => (
            <TouchableOpacity style={{ marginRight: 16 }}>
              <Text style={{ fontSize: 20, color: '#fff' }}>!</Text>
            </TouchableOpacity>
          ),
        }}
      />
      <Tab.Screen name="Maintenance" component={MaintenanceScreen} options={{ headerTitle: 'Maintenance Due' }} />
      <Tab.Screen name="History" component={HistoryScreen} options={{ headerTitle: 'Payment History' }} />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        initialParams={{ ...params, role }} 
        options={({navigation}) => ({
          headerTitle: 'Profile',

          headerRight: () => (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={()=> navigation.navigate('Settings')}
              style={{
                marginRight: 16,
              }}
            >
              <Text
                style={{
                  fontSize:20,
                  color:'#fff',
                }}
              >
                ⚙️
              </Text>
            </TouchableOpacity>
          ),
        })} 
      />
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
        <Stack.Screen name="OTP" component={OTPScreen} options={{ animation: 'slide_from_right', gestureEnabled: false }} />
        <Stack.Screen name="Society" component={SocietyScreen} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="Main" component={MainTabs} options={{ animation: 'fade' }} />
        <Stack.Screen
          name="Receipt"
          component={ReceiptScreen}
          options={stackHeader('Receipt', { animation: 'slide_from_bottom', presentation: 'modal' })}
        />
        <Stack.Screen
          name="AdminExpense"
          component={AdminExpenseScreen}
          options={stackHeader('Society Fund', { animation: 'slide_from_right' })}
        />
        <Stack.Screen
          name="SocietyFund"
          component={SocietyFundScreen}
          options={stackHeader('Fund Expense History', { animation: 'slide_from_right' })}
        />
        <Stack.Screen name="Subscription" component={SubscriptionScreen} options={stackHeader('Premium Plans')} />
        <Stack.Screen name="Settings" component={SettingsScreen} options={stackHeader('Settings')} />
        <Stack.Screen name="CollectMaintenance" component={CollectMaintenanceScreen} options={stackHeader('Collect Cash')} />
        <Stack.Screen name="CreateMaintenance" component={CreateMaintenanceScreen} options={stackHeader('Create Bill')} />
        <Stack.Screen name="ApproveReject" component={ApproveRejectScreen} options={stackHeader('Approvals')} />
        <Stack.Screen name="CreateNotice" component={CreateNoticeScreen} options={stackHeader('New Notice')} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const tabStyles = StyleSheet.create({
  outer: {
    backgroundColor: 'transparent',
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 18,
  },
  outerWide: { alignItems: 'center' },
  bar: {
    height: 62,
    width: '100%',
    maxWidth: 340,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 31,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 1)',
    padding: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
  },
  barWide: { maxWidth: 380 },
  tab: {
    flex: 1,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  tabActive: {
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  iconWrapActive: {
    backgroundColor: 'rgba(0, 0, 0, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.03)',
  },
  iconText: { fontSize: 22, opacity: 0.45 },
  iconTextActive: { opacity: 1 },
});
