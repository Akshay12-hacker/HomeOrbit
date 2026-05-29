import React, { useRef, useCallback, useState, useEffect } from 'react';
import { StyleSheet, View, ActivityIndicator, BackHandler, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { handleNativeAction } from './bridge/NativeMethods';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import { captureException } from '../services/sentry';

const WebViewContainer = ({ url, initialData = {} }) => {
  const webViewRef = useRef(null);
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(true);
  const [canGoBack, setCanGoBack] = useState(false);

  // Set up notification handler for the whole app
  useEffect(() => {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });

    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      sendMessageToWeb({
        type: 'NOTIFICATION_RECEIVED',
        data: notification.request.content
      });
    });

    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      sendMessageToWeb({
        type: 'NOTIFICATION_CLICKED',
        data: response.notification.request.content
      });
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    };
  }, []);

  // Handle Android Back Button
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (canGoBack && webViewRef.current) {
          webViewRef.current.goBack();
          return true;
        }
        return false;
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [canGoBack])
  );

  const sendMessageToWeb = useCallback((data) => {
    const message = JSON.stringify(data);
    const script = `
      (function() {
        var data = ${JSON.stringify(message)};
        window.dispatchEvent(new MessageEvent('message', { data: data }));
        document.dispatchEvent(new MessageEvent('message', { data: data }));
      })();
      true;
    `;
    webViewRef.current?.injectJavaScript(script);
  }, []);

  const onMessage = async (event) => {
    let message;

    try {
      message = JSON.parse(event.nativeEvent.data);
      const { messageId, action, payload } = message;

      if (!action) return;

      const result = await handleNativeAction(action, payload, { navigation });
      
      if (messageId) {
        sendMessageToWeb({ messageId, data: result });
      }
    } catch (error) {
      console.error('WebView Bridge Error:', error);

      captureException(error, {
        bridgeAction: message?.action,
        messageId: message?.messageId,
        source: 'WebViewBridge'
      });

      if (message?.messageId) {
        sendMessageToWeb({ messageId: message.messageId, error: error.message });
      }
    }
  };

  // Inject initial data/auth before content loads
  const injectedJavaScriptBeforeContentLoaded = `
    (function() {
      window.HomeOrbitNative = {
        initialData: ${JSON.stringify(initialData || {})},
        isNative: true,
        platform: '${Platform.OS}'
      };
    })();
    true;
  `;

  return (
    <SafeAreaView style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ uri: url }}
        onMessage={onMessage}
        onLoadStart={() => setIsLoading(true)}
        onLoadEnd={() => setIsLoading(false)}
        onNavigationStateChange={(navState) => setCanGoBack(navState.canGoBack)}
        injectedJavaScriptBeforeContentLoaded={injectedJavaScriptBeforeContentLoaded}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        cacheEnabled={true}
        mixedContentMode="always"
        pullToRefreshEnabled={true}
        allowsBackForwardNavigationGestures={true}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0000ff" />
          </View>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});

export default WebViewContainer;
