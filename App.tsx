import React from 'react';
import {StatusBar} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {NavigationContainer} from '@react-navigation/native';
import {AppNavigator} from './src/navigation/AppNavigator';
import {AuthProvider} from './src/auth/AuthContext';
import {PreferencesProvider} from './src/preferences/PreferencesContext';

function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <PreferencesProvider>
        <AuthProvider>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </AuthProvider>
      </PreferencesProvider>
    </SafeAreaProvider>
  );
}

export default App;
