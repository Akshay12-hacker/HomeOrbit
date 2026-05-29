import React from 'react';

import {
  createNativeStackNavigator,
} from '@react-navigation/native-stack';

import HybridHomeScreen from '../../screens/home/HybridHomeScreen';
import NativeSDUIScreen from '../../screens/home/NativeSDUIScreen';

import ReceiptScreen from '../../screens/payments/ReceiptScreen';

import SubscriptionScreen from '../../screens/payments/SubscriptionScreen';

import SettingsScreen from '../../screens/settings/SettingsScreen';

import SocietyFundScreen from '../../screens/society/SocietyFundScreen';

import AdminExpenseScreen from '../../screens/society/AdminExpenseScreen';
import AddExpenseScreen from '../../screens/society/AddExpenseScreen';
import ReceiptUploadScreen from '../../screens/society/ReceiptUploadScreen';

import CollectMaintenanceScreen from '../../screens/maintenance/CollectMaintenanceScreen';

import CreateMaintenanceScreen from '../../screens/maintenance/CreateMaintenanceScreen';

import ApproveRejectScreen from '../../screens/maintenance/ApproveRejectScreen';

import CreateNoticeScreen from '../../screens/society/CreateNoticeScreen';
import NotificationScreen from '../../screens/notifications/NotificationScreen';
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
        name="HybridHome"
        component={
          HybridHomeScreen
        }
        initialParams={
          appParams
        }
      />

      <Stack.Screen
        name="NativeSDUI"
        component={
          NativeSDUIScreen
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
        name="ReceiptUpload"
        component={
          ReceiptUploadScreen
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
        name="AddExpense"
        component={
          AddExpenseScreen
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

      <Stack.Screen
        name="Notifications"
        component={NotificationScreen}
      />
    </Stack.Navigator>
  );
}
