import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {ReservationsScreen} from '../screens/ReservationsScreen';
import {BookingDetailScreen} from '../screens/BookingDetailScreen';
import {DetailScreen} from '../screens/DetailScreen';
import {BookingListItem} from '../services/bookingApi';
import {Room} from '../data/room';

export type ReservationsStackParamList = {
  ReservationsList: undefined;
  BookingDetail: {
    booking: BookingListItem;
  };
  Detail: {
    room: Room;
    nights: number;
    destination: string;
    dateRange: string;
    adults: number;
    checkin: string;
    checkout: string;
    viewOnly?: boolean;
  };
};

const Stack = createNativeStackNavigator<ReservationsStackParamList>();

export const ReservationsStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="ReservationsList" component={ReservationsScreen} />
      <Stack.Screen name="BookingDetail" component={BookingDetailScreen} />
      <Stack.Screen name="Detail" component={DetailScreen} />
    </Stack.Navigator>
  );
};
