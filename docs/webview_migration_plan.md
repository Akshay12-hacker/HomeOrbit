# Hybrid WebView Architecture for HomeOrbit

This document outlines the architectural blueprint for converting HomeOrbit into a production-grade, highly scalable hybrid WebView app. This approach mirrors the strategies used by high-frequency transactional apps (like Swiggy, Zomato, or Uber for specific flows) to decouple UI iterations from app store release cycles.

## 1. Core Stack & Architecture

**Web App Stack:**
*   **Framework:** Next.js (App Router, React server components for rapid initial load).
*   **Styling:** Tailwind CSS (utility-first, excellent for dynamic theming and mobile-first layouts).
*   **State Management:** Zustand (lightweight) or React Context for global state (themes, auth).

**Native App Stack:**
*   **Framework:** React Native (Expo).
*   **WebView:** `react-native-webview`.
*   **Navigation:** React Navigation (kept minimal, primarily to handle deep links and route them into the WebView).

**Architecture Pattern:**
The architecture relies on a **Thin Native Client / Thick Web Server** model. The native app acts as a secure, privileged container that exposes native device capabilities to an isolated web sandbox via an asynchronous message bridge.

---

## 2. Production-Ready Folder Structure

### React Native (Container)
```text
src/
├── webview/
│   ├── WebViewContainer.js      # Main WebView wrapper with error/loading states
│   ├── bridge/
│   │   ├── NativeMethods.js     # Implementations (Camera, Location, Push)
│   │   ├── MessageHandler.js    # Routes window.ReactNativeWebView.postMessage
│   │   └── InjectableScripts.js # Scripts to inject on load (e.g., polyfills, auth tokens)
├── navigation/
│   └── AppNavigator.js          # Handles deep links to specific WebView routes
├── native-features/             # Native wrappers (Push, Permissions, Storage)
└── utils/
    ├── offlineStorage.js        # AsyncStorage/MMKV for offline fallbacks
    └── security.js              # SSL pinning, domain validation
```

### Next.js (Web App)
```text
src/
├── app/
│   ├── layout.tsx               # Handles global SDUI fetching & Native Bridge Context
│   └── (routes)/                # App routes
├── bridge/
│   ├── NativeClient.ts          # Wraps window.ReactNativeWebView.postMessage
│   └── NativeListener.ts        # Listens for messages from Native
├── sdui/                        # Server-Driven UI logic
│   ├── ThemeProvider.tsx        # Injects dynamic Tailwind config / CSS variables
│   └── components/              # Dynamically rendered components based on JSON
└── features/                    # Domain logic
```

---

## 3. The Communication Bridge

The communication between the Web App and Native Container is asynchronous. We use a standard Request/Response pattern with correlation IDs.

### A. Web App -> Native (Requesting Native Features)

**Web Side (`NativeClient.ts`):**
```typescript
export const invokeNative = (action: string, payload: any = {}): Promise<any> => {
  return new Promise((resolve, reject) => {
    const messageId = Math.random().toString(36).substring(7);
    
    // Set up one-time listener for the response
    const listener = (event: MessageEvent) => {
      try {
        const response = JSON.parse(event.data);
        if (response.messageId === messageId) {
          window.removeEventListener('message', listener);
          if (response.error) reject(new Error(response.error));
          else resolve(response.data);
        }
      } catch (e) { /* ignore non-JSON messages */ }
    };
    
    window.addEventListener('message', listener);
    
    // Send to Native
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify({
        messageId,
        action,
        payload
      }));
    } else {
      reject(new Error("Native bridge not found. Are you in a browser?"));
    }
  });
};

// Usage:
// const location = await invokeNative('GET_LOCATION', { highAccuracy: true });
```

### B. Native -> Web App (Handling Requests & Pushing Events)

**Native Side (`WebViewContainer.js`):**
```javascript
import React, { useRef, useCallback, useEffect } from 'react';
import { WebView } from 'react-native-webview';
import { handleNativeAction } from './bridge/NativeMethods';

export const HybridContainer = ({ url, initialToken }) => {
  const webViewRef = useRef(null);

  // Script injected BEFORE web app loads
  const injectedAuthScript = `
    window.INITIAL_AUTH_TOKEN = '${initialToken}';
    true; // Required by Android WebView
  `;

  // Send message back to Web
  const sendMessageToWeb = useCallback((data) => {
    const script = `window.postMessage(${JSON.stringify(data)}, '*');`;
    webViewRef.current?.injectJavaScript(script);
  }, []);

  // Handle messages from Web
  const onMessage = useCallback(async (event) => {
    try {
      const { messageId, action, payload } = JSON.parse(event.nativeEvent.data);
      
      // Execute native function (e.g., Location, Camera, Haptic)
      const result = await handleNativeAction(action, payload);
      
      // Reply to Web
      sendMessageToWeb({ messageId, data: result });
    } catch (error) {
      // Send error back
      sendMessageToWeb({ messageId, error: error.message });
    }
  }, [sendMessageToWeb]);

  return (
    <WebView
      ref={webViewRef}
      source={{ uri: url }}
      onMessage={onMessage}
      injectedJavaScriptBeforeContentLoaded={injectedAuthScript}
      allowsBackForwardNavigationGestures
      pullToRefreshEnabled
      bounces={false}
      // Performance
      cacheEnabled={true}
      cacheMode="LOAD_DEFAULT"
      // Security
      allowsInlineMediaPlayback={false}
      javaScriptEnabled={true}
      originWhitelist={['https://homeorbit.com']}
    />
  );
};
```

---

## 4. Server-Driven UI (SDUI) & Dynamic Theming

By utilizing Next.js Server Components, you can fetch theme config at the edge/server level before sending HTML to the client.

**JSON Payload Example (from backend API):**
```json
{
  "theme": {
    "primaryColor": "#FF5733",
    "backgroundMode": "dark",
    "fontFamily": "Inter"
  },
  "features": {
    "enableFestivalBanner": true,
    "showDiwaliOffers": true
  },
  "layout": [
    { "type": "HeroCarousel", "data": { "images": ["url1", "url2"] } },
    { "type": "QuickActions", "data": { "actions": ["pay_bill", "book_amenity"] } }
  ]
}
```

**Web App Implementation (Tailwind CSS Variables):**
Inject the CSS variables in the root layout based on the fetched JSON. Tailwind config is set up to read from these CSS variables (e.g., `colors: { primary: 'var(--primary-color)' }`). This allows instantaneous theme changes without code deployments.

---

## 5. Performance Optimization Checklist

To make a WebView feel like a native app, stringent performance rules apply:

1. **Caching Strategy:**
   * Implement rigorous `Cache-Control` headers on your Next.js server.
   * Use Service Workers (PWA) to cache static assets (fonts, icons, JS bundles) so subsequent app opens are near-instantaneous.
2. **Pre-connection & DNS:**
   * Have the native app pre-fetch the DNS and establish an HTTP connection to the web server during the native splash screen.
3. **Animations:**
   * NEVER animate `width`, `height`, `top`, `left`.
   * ALWAYS animate `transform` (translate, scale) and `opacity`. This forces hardware acceleration (GPU) inside the WebView.
4. **Touch Interactions:**
   * Disable default web touch behaviors in CSS:
     ```css
     html {
       -webkit-tap-highlight-color: transparent;
       overscroll-behavior-y: none; /* Prevents web browser pull-to-refresh bounce */
       user-select: none;
       -webkit-touch-callout: none;
     }
     ```
5. **Fast Click:**
   * Ensure standard elements don't suffer from the 300ms tap delay (modern browsers usually handle this if `viewport` meta tag is set correctly).
6. **Lazy Loading:**
   * Next.js `next/image` and dynamic imports for components below the fold.

---

## 6. Security Checklist

1. **Domain Whitelisting:** Use `originWhitelist` in `react-native-webview` strictly for your production domain. Reject navigation to external domains.
2. **Deep Linking Interception:** If a user clicks an external link in the WebView, catch it via `onShouldStartLoadWithRequest` and open it in the native OS browser (Safari/Chrome), keeping the WebView strictly for the app.
3. **Token Management:** Store JWTs in Native Secure Storage (e.g., `expo-secure-store`). Inject them via `injectedJavaScriptBeforeContentLoaded` headers or bridge calls. **Do not** store them in Web `localStorage`.
4. **Disable Debugging:** In production, ensure `setWebContentsDebuggingEnabled(false)` (Android) and `isInspectable={false}` (iOS 16.4+).

---

## 7. Future Hybrid Migration Strategy

If the WebView approach faces insurmountable performance issues on lower-end Android devices, the architecture allows for a graceful degradation to native:

**Phase 1: Hybrid Navigation**
*   Move the Tab Bar and Navigation Header to **React Native**.
*   The WebView renders *only* the content of the active tab.
*   The Native Tab bar communicates with the WebView via the bridge to change routes (e.g., using `router.push()` in Next.js).

**Phase 2: High-Frequency Screens go Native**
*   Keep dynamic/promotional pages (Home, Offers, Profile) as WebViews.
*   Rewrite high-interaction, performance-critical flows (e.g., Complex Payment Flow, Map Tracking) in React Native.
*   Native navigation routes between a `WebViewScreen` and a `NativePaymentScreen`.

**Phase 3: Full Native SDUI**
*   Instead of parsing the SDUI JSON in Next.js to render HTML, parse the *same JSON* directly in React Native using a rendering engine (mapping `type: "HeroCarousel"` to a native `<Carousel />` component). This is exactly how Swiggy and Airbnb scale.

----------------------------------------
 This is the complete Master Implementation Guide to set up, develop, and deploy your HomeOrbit Hybrid
  app.

  ---

  Phase 1: Native App Preparation (The Shell)
  You have already completed most of this in our session, but ensure these steps are verified:

   1. Environment Sync:
       * Open .env and set WEB_APP_URL to your hosted web app (e.g., https://homeorbit-web.vercel.app).
       * Ensure expo-location, expo-notifications, and react-native-webview are in package.json.

   2. Verify the Entry Point:
       * The app now boots into src/navigation/RootNavigator.js.
       * After login, it navigates to AppStackNavigator.js, which now uses HybridHomeScreen.js (our
         WebView wrapper) instead of the old native tabs.

  ---

  Phase 2: Web App Setup (The Core UI)
  This is where 90% of your future development will happen.

   1. Initialize Next.js:

   1     npx create-next-app@latest homeorbit-web --typescript --tailwind --eslint
   2. Install the Bridge Helper:
      Create a file in your web app: src/utils/nativeBridge.ts:

    1     export const invokeNative = (action: string, payload: any = {}): Promise<any> => {
    2       return new Promise((resolve, reject) => {
    3         if (typeof window === 'undefined' || !window.ReactNativeWebView) {
    4           return reject("Not in Native Environment");
    5         }
    6         const messageId = Math.random().toString(36).substring(7);
    7         const listener = (event: any) => {
    8           try {
    9             const response = JSON.parse(event.data);
   10             if (response.messageId === messageId) {
   11               window.removeEventListener('message', listener);
   12               response.error ? reject(response.error) : resolve(response.data);
   13             }
   14           } catch (e) {}
   15         };
   16         window.addEventListener('message', listener);
   17         window.ReactNativeWebView.postMessage(JSON.stringify({ messageId, action, payload }));
   18       });
   19     };

   3. Handle Auto-Login:
      In your layout.tsx or _app.js, check for the injected session:

   1     useEffect(() => {
   2       const nativeData = window.HomeOrbitNative?.initialData;
   3       if (nativeData?.session) {
   4         // Automatically log the user into your Web App using the native token
   5         loginUserWithToken(nativeData.session.token);
   6       }
   7     }, []);

  ---

  Phase 3: Developing Hybrid Features
  Use these patterns to make the web app feel native:

   * To get user location:
   1     const location = await invokeNative('GET_LOCATION');
   * To take a photo for a society expense:

   1     const photo = await invokeNative('TAKE_PHOTO');
   2     // returns { uri, width, height, base64 }
   * To setup Push Notifications:

   1     const { token } = await invokeNative('GET_PUSH_TOKEN');
   2     // Send this token to your backend to target this user

  ---

  Phase 4: Styling for "Native" Feel
  Add this to your Web App's globals.css to prevent it from "feeling like a website":

    1 body {
    2   /* Prevent blue highlight on tap */
    3   -webkit-tap-highlight-color: transparent;
    4   /* Prevent pull-to-refresh bounce on body */
    5   overscroll-behavior-y: none;
    6   /* Standard native font stack */
    7   font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica;
    8   /* Prevent text selection unless needed */
    9   user-select: none;
   10 }
   11
   12 /* Make sure all inputs are easy to tap */
   13 input, button {
   14   touch-action: manipulation;
   15 }

  ---

  Phase 5: Deployment Flow (The "No-Update" Strategy)

   1. Deploy Web:
       * Push your Next.js code to GitHub.
       * Connect it to Vercel.
       * Every time you push to main, the Android app updates instantly for all users.

   2. Deploy Native (One-time or major changes):
       * Install EAS CLI: npm install -g eas-cli.
       * Build the APK: eas build --platform android --profile production.
       * Upload the APK to Google Play Store.
       * Note: You only need to do this step if you add a new native capability to NativeMethods.js.

  ---

  Phase 6: Monitoring & Performance
   1. Check Sentry: Log into your Sentry dashboard to see any bridge errors.
   2. Optimize Images: Use Next.js next/image to ensure images are compressed before reaching the
      phone.
   3. Lazy Load: Use next/dynamic for components below the fold to make the initial WebView load
      faster.

  What to do now?
   1. Go to your hosting provider (Vercel/Azure) and deploy a simple "Hello World" Next.js app.
   2. Update your .env in the React Native project to point to that URL.
   3. Run npx expo start and open the app on your Android device.
   4. You will see your website inside the app shell!

  Need help with a specific part of this flow? Just ask!