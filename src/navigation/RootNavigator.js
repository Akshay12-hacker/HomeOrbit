import React from 'react';

import {
  createNativeStackNavigator,
} from '@react-navigation/native-stack';

import SplashScreen from '../screens/auth/SplashScreen';

import OnboardingScreen from '../screens/onboarding/OnboardingScreen';

import AuthNavigator from './stacks/AuthNavigator';
import AppStackNavigator from './stacks/AppStackNavigator';
import ErrorScreen from '../screens/error/ErrorScreen';

import {
  hasSeenOnboarding,
} from '../storage/appStorage';

import {
  restoreSession,
} from '../services/auth/restoreSession';

import {
  authStore,
} from '../stores/authStore';

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

  React.useEffect(() => {
    return authStore.subscribe(
      (authState) => {
        setAuthenticated(
          !!authState.authenticated
        );
      }
    );
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
      key={`${onboarded}-${authenticated}`}
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
      {!authenticated ? (
        <>
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
        </>
      ) : (
        <Stack.Screen
          name="App"
          component={
            AppStackNavigator
          }
        />
      )}

      <Stack.Screen
        name="Error"
        component={ErrorScreen}
        options={{ animation: 'fade' }}
      />
    </Stack.Navigator>
  );
}
