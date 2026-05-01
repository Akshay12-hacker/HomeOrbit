import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { installGlobalErrorLogger } from './src/services/errorHandler';

export default function App() {
  useEffect(() => {
    installGlobalErrorLogger();
  }, []);

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#0F2557" />
      <AppNavigator />
    </>
  );
}
