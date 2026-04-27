/**
 * @format
 */

import { AppRegistry } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import App from './App';
import { name as appName } from './app.json';

// Background message handler — debe registrarse fuera del componente.
messaging().setBackgroundMessageHandler(async remoteMessage => {
  if (__DEV__) {
    console.log('[push] Background message received:', remoteMessage);
  }
});

AppRegistry.registerComponent(appName, () => App);
