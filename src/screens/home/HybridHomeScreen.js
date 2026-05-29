import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import WebViewContainer from '../../webview/WebViewContainer';
import { authStorage } from '../../storage/authStorage';
import { WEB_APP_URL } from '@env'; // Ensure you have this in your .env and babel-plugin-dotenv is working

const HybridHomeScreen = () => {
  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAuthData();
  }, []);

  const loadAuthData = async () => {
    try {
      const session = await authStorage.getSession();
      const user = await authStorage.getUser();
      
      setInitialData({
        session,
        user,
        config: {
          platform: 'android',
          version: '1.0.0', // Should come from app.json/Constants
        }
      });
    } catch (error) {
      console.error('Failed to load auth data for WebView:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return null;

  // Fallback URL if .env is not loaded correctly
  const url = WEB_APP_URL || 'https://homeorbit-web.vercel.app';

  return (
    <View style={styles.container}>
      <WebViewContainer 
        url={url} 
        initialData={initialData} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default HybridHomeScreen;
