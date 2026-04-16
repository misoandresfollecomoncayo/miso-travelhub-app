import React from 'react';
import {View, ActivityIndicator, StyleSheet} from 'react-native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {LoginScreen} from '../screens/LoginScreen';
import {RegisterScreen} from '../screens/RegisterScreen';
import {ForgotPasswordScreen} from '../screens/ForgotPasswordScreen';
import {UserProfileScreen} from '../screens/UserProfileScreen';
import {TermsAndConditionsScreen} from '../screens/TermsAndConditionsScreen';
import {Colors} from '../theme/colors';
import {useAuth} from '../auth/AuthContext';

export type UserStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  UserProfile: undefined;
  TermsAndConditions: undefined;
};

const Stack = createNativeStackNavigator<UserStackParamList>();

const SplashView: React.FC = () => (
  <View style={styles.splash} testID="user-stack-splash">
    <ActivityIndicator size="large" color={Colors.primary} />
  </View>
);

export const UserStackNavigator: React.FC = () => {
  const {user, initializing} = useAuth();

  if (initializing) {
    return <SplashView />;
  }

  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      {user ? (
        <Stack.Screen name="UserProfile" component={UserProfileScreen} />
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen
            name="ForgotPassword"
            component={ForgotPasswordScreen}
          />
          <Stack.Screen
            name="TermsAndConditions"
            component={TermsAndConditionsScreen}
          />
        </>
      )}
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
  },
});
