import React from 'react';

import {
  createNativeStackNavigator,
} from '@react-navigation/native-stack';

import MainTabNavigator from '../tabs/MainTabNavigator';

import ReceiptScreen from '../../screens/payments/ReceiptScreen';

import SubscriptionScreen from '../../screens/payments/SubscriptionScreen';

import SettingsScreen from '../../screens/settings/SettingsScreen';

import SocietyFundScreen from '../../screens/society/SocietyFundScreen';

import AdminExpenseScreen from '../../screens/society/AdminExpenseScreen';

import CollectMaintenanceScreen from '../../screens/maintenance/CollectMaintenanceScreen';

import CreateMaintenanceScreen from '../../screens/maintenance/CreateMaintenanceScreen';

import ApproveRejectScreen from '../../screens/maintenance/ApproveRejectScreen';

import CreateNoticeScreen from '../../screens/society/CreateNoticeScreen';

import PaymentSuccessScreen from '../../screens/payments/PaymentSuccessScreen';

const Stack =
  createNativeStackNavigator();

export default function AppStackNavigator({
  route,
}) {
  const appParams =
    route?.params || {};

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,

        animation:
          'slide_from_right',
      }}
    >
      <Stack.Screen
        name="MainTabs"
        component={
          MainTabNavigator
        }
        initialParams={
          appParams
        }
      />

      <Stack.Screen
        name="Subscription"
        component={
          SubscriptionScreen
        }
      />

      <Stack.Screen
        name="PaymentSuccess"
        component={
          PaymentSuccessScreen
        }
        options={{
          animation:
            'fade_from_bottom',
        }}
      />

      <Stack.Screen
        name="Receipt"
        component={
          ReceiptScreen
        }
        options={{
          presentation:
            'modal',

          animation:
            'slide_from_bottom',
        }}
      />

      <Stack.Screen
        name="Settings"
        component={
          SettingsScreen
        }
      />

      <Stack.Screen
        name="SocietyFund"
        component={
          SocietyFundScreen
        }
      />

      <Stack.Screen
        name="AdminExpense"
        component={
          AdminExpenseScreen
        }
      />

      <Stack.Screen
        name="CollectMaintenance"
        component={
          CollectMaintenanceScreen
        }
      />

      <Stack.Screen
        name="CreateMaintenance"
        component={
          CreateMaintenanceScreen
        }
      />

      <Stack.Screen
        name="ApproveReject"
        component={
          ApproveRejectScreen
        }
      />

      <Stack.Screen
        name="CreateNotice"
        component={
          CreateNoticeScreen
        }
      />
    </Stack.Navigator>
  );
}
