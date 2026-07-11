import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import WebViewContainer from '../../webview/WebViewContainer';
import { authStorage } from '../../storage/authStorage';
import { WEB_APP_URL } from '@env'; // Ensure you have this in your .env and babel-plugin-dotenv is working

const buildWebAppUrl = (baseUrl, path) => {
  const normalizedBase = (baseUrl || '').replace(/\/+$/, '');
  const normalizedPath = path?.startsWith('/') ? path : `/${path || ''}`;
  return `${normalizedBase}${normalizedPath === '/' ? '' : normalizedPath}`;
};

const HybridHomeScreen = ({ route }) => {
  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialPath, setInitialPath] = useState(route?.params?.initialPath || '');

  useEffect(() => {
    loadAuthData();
  }, []);

  const loadAuthData = async () => {
    try {
      const session = await authStorage.getSession();
      const user = await authStorage.getUser();
      const isSuperAdmin = Array.isArray(user?.roles) && user.roles.includes('SuperAdmin');
      const resolvedInitialPath = route?.params?.initialPath || (isSuperAdmin ? '/super-admin' : '');
      
      setInitialData({
        session,
        user,
        config: {
          platform: 'android',
          version: '1.0.0', // Should come from app.json/Constants
        }
      });
      setInitialPath(resolvedInitialPath);
    } catch (error) {
      console.error('Failed to load auth data for WebView:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return null;

  // Fallback URL if .env is not loaded correctly
  const url = buildWebAppUrl(WEB_APP_URL || 'https://homeorbit-web.vercel.app', initialPath);

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
