import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import {SearchStackNavigator} from './SearchStackNavigator';
import {UserStackNavigator} from './UserStackNavigator';
import {ReservationsStackNavigator} from './ReservationsStackNavigator';
import {Colors} from '../theme/colors';
import {useT} from '../i18n/useT';

const Tab = createBottomTabNavigator();

export const AppNavigator: React.FC = () => {
  const t = useT();
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
          tabBarLabel: t('tab.search'),
          tabBarButtonTestID: 'tab-search',
          tabBarIcon: ({color, size}) => (
            <Icon name="search-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Reservas"
        component={ReservationsStackNavigator}
        options={{
          tabBarLabel: t('tab.reservations'),
          tabBarButtonTestID: 'tab-reservations',
          tabBarIcon: ({color, size}) => (
            <Icon name="calendar-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Usuario"
        component={UserStackNavigator}
        options={{
          tabBarLabel: t('tab.user'),
          tabBarButtonTestID: 'tab-user',
          tabBarIcon: ({color, size}) => (
            <Icon name="person-outline" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};
