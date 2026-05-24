import React from 'react';

import {
  createNativeStackNavigator,
} from '@react-navigation/native-stack';

import SplashScreen from '../screens/auth/SplashScreen';

import OnboardingScreen from '../screens/onboarding/OnboardingScreen';

import AuthNavigator from './stacks/AuthNavigator';

import AppStackNavigator from './stacks/AppStackNavigator';

import {
  hasSeenOnboarding,
} from '../storage/appStorage';

import {
  restoreSession,
} from '../services/auth/restoreSession';

const Stack =
  createNativeStackNavigator();

export default function RootNavigator() {
  const [
    loading,
    setLoading,
  ] = React.useState(true);

  const [
    onboarded,
    setOnboarded,
  ] = React.useState(false);

  const [
    authenticated,
    setAuthenticated,
  ] = React.useState(false);

  React.useEffect(() => {
    bootstrap();
  }, []);

  const bootstrap =
    async () => {
      try {
        const onboardingSeen =
          await hasSeenOnboarding();

        const session =
          await restoreSession();

        setOnboarded(
          !!onboardingSeen
        );

        setAuthenticated(
          !!session
        );
      } catch (_error) {
      } finally {
        setLoading(false);
      }
    };

  if (loading) {
    return (
      <SplashScreen />
    );
  }

  return (
    <Stack.Navigator
      initialRouteName={
        !onboarded
          ? 'Onboarding'
          : authenticated
            ? 'App'
            : 'Auth'
      }
      screenOptions={{
        headerShown: false,
      }}
    >
      {!onboarded && (
        <Stack.Screen
          name="Onboarding"
          component={
            OnboardingScreen
          }
        />
      )}

      <Stack.Screen
        name="Auth"
        component={
          AuthNavigator
        }
      />

      <Stack.Screen
        name="App"
        component={
          AppStackNavigator
        }
      />
    </Stack.Navigator>
  );
}
