import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {SearchScreen} from '../screens/SearchScreen';
import {ResultsScreen} from '../screens/ResultsScreen';
import {DetailScreen} from '../screens/DetailScreen';
import {ReservationScreen} from '../screens/ReservationScreen';
import {ReservationSuccessScreen} from '../screens/ReservationSuccessScreen';
import {ReservationPoliciesScreen} from '../screens/ReservationPoliciesScreen';
import {PaymentScreen} from '../screens/PaymentScreen';
import {Room} from '../data/room';

export type SearchStackParamList = {
  Search: undefined;
  Results: {
    destination: string;
    dateRange: string;
    adults: number;
    ciudad: string;
    checkin: string;
    checkout: string;
    rooms: number;
  };
  Detail: {
    room: Room;
    nights: number;
    destination: string;
    dateRange: string;
    adults: number;
    checkin: string;
    checkout: string;
  };
  Reservation: {
    room: Room;
    nights: number;
    destination: string;
    dateRange: string;
    adults: number;
    checkin: string;
    checkout: string;
  };
  ReservationSuccess: {
    nombreHotel: string;
    destination: string;
    dateRange: string;
    nights: number;
    adults: number;
    total: number;
    confirmationCode: string;
  };
  ReservationPolicies: undefined;
  Payment: {
    nombreHotel: string;
    destination: string;
    dateRange: string;
    nights: number;
    adults: number;
    total: number;
  };
};

const Stack = createNativeStackNavigator<SearchStackParamList>();

export const SearchStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="Search" component={SearchScreen} />
      <Stack.Screen name="Results" component={ResultsScreen} />
      <Stack.Screen name="Detail" component={DetailScreen} />
      <Stack.Screen name="Reservation" component={ReservationScreen} />
      <Stack.Screen
        name="ReservationSuccess"
        component={ReservationSuccessScreen}
      />
      <Stack.Screen
        name="ReservationPolicies"
        component={ReservationPoliciesScreen}
      />
      <Stack.Screen name="Payment" component={PaymentScreen} />
    </Stack.Navigator>
  );
};
