import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {ReservationsScreen} from '../screens/ReservationsScreen';
import {BookingDetailScreen} from '../screens/BookingDetailScreen';
import {DetailScreen} from '../screens/DetailScreen';
import {BookingListItem} from '../services/bookingApi';
import {Room} from '../data/room';

/**
 * Params de `BookingDetail`: se acepta uno de dos modos, mutuamente
 * exclusivos:
 *
 *  - `booking`: el objeto completo. Se usa al tappear una reserva desde la
 *    lista, donde ya tenemos la data.
 *  - `bookingId`: solo el id. Se usa cuando el usuario abre la app desde
 *    una push notification — la pantalla pide la lista de reservas y
 *    resuelve el objeto por id.
 *
 * Mantenemos ambos opcionales para no romper a callers existentes; la
 * validación de "al menos uno" se hace en runtime dentro del screen.
 */
export type ReservationsStackParamList = {
  ReservationsList: undefined;
  BookingDetail: {
    booking?: BookingListItem;
    bookingId?: string;
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
