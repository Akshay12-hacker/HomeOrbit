import React from 'react';

import {
  createNativeStackNavigator,
} from '@react-navigation/native-stack';

import LoginScreen from '../../screens/auth/LoginScreen';

import OTPScreen from '../../screens/auth/OTPScreen';

import SocietyScreen from '../../screens/society/SocietyScreen';

const Stack =
  createNativeStackNavigator();

export default function AuthNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="Login"
        component={LoginScreen}
      />

      <Stack.Screen
        name="OTP"
        component={OTPScreen}
      />

      <Stack.Screen
        name="Society"
        component={SocietyScreen}
      />
    </Stack.Navigator>
  );
}
