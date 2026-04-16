import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import {SearchStackNavigator} from './SearchStackNavigator';
import {UserStackNavigator} from './UserStackNavigator';
import {ReservationsScreen} from '../screens/ReservationsScreen';
import {Colors} from '../theme/colors';

const Tab = createBottomTabNavigator();

export const AppNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.gray,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: Colors.grayBorder,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}>
      <Tab.Screen
        name="Buscar"
        component={SearchStackNavigator}
        options={{
          tabBarIcon: ({color, size}) => (
            <Icon name="search-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Reservas"
        component={ReservationsScreen}
        options={{
          tabBarIcon: ({color, size}) => (
            <Icon name="calendar-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Usuario"
        component={UserStackNavigator}
        options={{
          tabBarIcon: ({color, size}) => (
            <Icon name="person-outline" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};
