import React from 'react';
import {View, Text, FlatList, TouchableOpacity, StyleSheet} from 'react-native';
import {useRoute, useNavigation} from '@react-navigation/native';
import {RouteProp} from '@react-navigation/native';
import {Colors} from '../theme/colors';
import {AccommodationCard} from '../components/AccommodationCard';
import {mockAccommodations} from '../data/mockData';
import {SearchStackParamList} from '../navigation/SearchStackNavigator';

type ResultsRouteProp = RouteProp<SearchStackParamList, 'Results'>;

export const ResultsScreen: React.FC = () => {
  const route = useRoute<ResultsRouteProp>();
  const navigation = useNavigation();
  const {destination, dateRange, adults} = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {mockAccommodations.length} hospedajes encontrados
      </Text>

      <View style={styles.summaryCard}>
        <View style={styles.summaryContent}>
          <Text style={styles.summaryText}>
            <Text style={styles.summaryLabel}>Destino: </Text>
            {destination}
          </Text>
          <Text style={styles.summaryText}>
            <Text style={styles.summaryLabel}>Fechas: </Text>
            {dateRange}
          </Text>
          <Text style={styles.summaryText}>
            <Text style={styles.summaryLabel}>Numero de adultos: </Text>
            {adults}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.editIcon}>{'\u270E'}</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={mockAccommodations}
        keyExtractor={item => item.id}
        renderItem={({item}) => <AccommodationCard accommodation={item} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginVertical: 20,
  },
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.grayBorder,
    borderRadius: 8,
    padding: 14,
    marginBottom: 8,
  },
  summaryContent: {
    flex: 1,
  },
  summaryText: {
    fontSize: 14,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  summaryLabel: {
    fontWeight: '700',
  },
  editButton: {
    justifyContent: 'center',
    paddingLeft: 12,
  },
  editIcon: {
    fontSize: 20,
    color: Colors.textSecondary,
  },
  listContent: {
    paddingBottom: 20,
  },
});
