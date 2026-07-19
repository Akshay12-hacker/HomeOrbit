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

  const bootstrap = async () => {
  const start = Date.now();

  try {
    const onboardingSeen = await hasSeenOnboarding();

    const session = await restoreSession();

    setOnboarded(!!onboardingSeen);
    setAuthenticated(!!session);
  } catch (error) {
    console.error(error);
  } finally {
    const elapsed = Date.now() - start;

    const minimumSplashTime = 2500;

    if (elapsed < minimumSplashTime) {
      await new Promise(resolve =>
        setTimeout(resolve, minimumSplashTime - elapsed)
      );
    }

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
        authenticated
          ? 'App'
          : !onboarded
            ? 'Onboarding'
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
