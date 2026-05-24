import 'react-native-gesture-handler';

import 'react-native-reanimated';

import React from 'react';

import * as Font from 'expo-font';

import {
  GestureHandlerRootView,
} from 'react-native-gesture-handler';

import {
  SafeAreaProvider,
} from 'react-native-safe-area-context';

import { ThemeProvider } from './src/theme/ThemeContext';
import { ScrollProvider } from './src/theme/ScrollContext';

import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  const [fontsLoaded] = Font.useFonts({
    DMSans_400Regular: require('@expo-google-fonts/dm-sans/400Regular/DMSans_400Regular.ttf'),
    DMSans_500Medium: require('@expo-google-fonts/dm-sans/500Medium/DMSans_500Medium.ttf'),
    Poppins_500Medium: require('@expo-google-fonts/poppins/500Medium/Poppins_500Medium.ttf'),
    Poppins_600SemiBold: require('@expo-google-fonts/poppins/600SemiBold/Poppins_600SemiBold.ttf'),
    Poppins_700Bold: require('@expo-google-fonts/poppins/700Bold/Poppins_700Bold.ttf'),
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView
      style={{ flex: 1 }}
    >
      <ThemeProvider>
        <ScrollProvider>
          <SafeAreaProvider>
            <AppNavigator />
          </SafeAreaProvider>
        </ScrollProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
