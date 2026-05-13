import React from 'react';
import {StatusBar} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {NavigationContainer} from '@react-navigation/native';
import {AppNavigator} from './src/navigation/AppNavigator';
import {navigationRef} from './src/navigation/navigationRef';
import {AuthProvider} from './src/auth/AuthContext';
import {PreferencesProvider} from './src/preferences/PreferencesContext';
import {ForegroundNotificationBanner} from './src/notifications/ForegroundNotificationBanner';
import {NotificationOpenHandler} from './src/notifications/NotificationOpenHandler';

function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <PreferencesProvider>
        <AuthProvider>
          <NavigationContainer ref={navigationRef}>
            <AppNavigator />
          </NavigationContainer>
          <ForegroundNotificationBanner />
          <NotificationOpenHandler />
        </AuthProvider>
      </PreferencesProvider>
    </SafeAreaProvider>
  );
}

export default App;
