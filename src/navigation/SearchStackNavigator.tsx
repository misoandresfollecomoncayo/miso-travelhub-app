import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {SearchScreen} from '../screens/SearchScreen';
import {ResultsScreen} from '../screens/ResultsScreen';

export type SearchStackParamList = {
  Search: undefined;
  Results: {
    destination: string;
    dateRange: string;
    adults: number;
    children: number;
  };
};

const Stack = createNativeStackNavigator<SearchStackParamList>();

export const SearchStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="Search" component={SearchScreen} />
      <Stack.Screen name="Results" component={ResultsScreen} />
    </Stack.Navigator>
  );
};
