import React, {useState, useRef} from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import {useRoute, useNavigation} from '@react-navigation/native';
import {RouteProp} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {Colors} from '../theme/colors';
import {SearchStackParamList} from '../navigation/SearchStackNavigator';
import {StarRating} from '../components/StarRating';
import {formatPrice} from '../utils/format';
import {resolveImageList} from '../utils/images';
import {getAmenityIcon} from '../utils/amenityIcons';

type DetailRouteProp = RouteProp<SearchStackParamList, 'Detail'>;
type DetailNavigationProp = NativeStackNavigationProp<
  SearchStackParamList,
  'Detail'
>;

const GALLERY_HEIGHT = 380;

const capitalize = (value: string): string =>
  value.length === 0 ? value : value.charAt(0).toUpperCase() + value.slice(1);

export const DetailScreen: React.FC = () => {
  const route = useRoute<DetailRouteProp>();
  const navigation = useNavigation<DetailNavigationProp>();
  const {room, nights, destination, dateRange, adults, checkin, checkout} =
    route.params;

  const [currentIndex, setCurrentIndex] = useState(0);
  const screenWidth = useRef(Dimensions.get('window').width).current;
  const scrollY = useRef(new Animated.Value(0)).current;

  const images = resolveImageList(room.imagenes);
  const totalImages = images.length;
  const totalPrice = room.precio * nights;
  const nightsLabel = nights === 1 ? 'noche' : 'noches';

  const galleryTranslateY = scrollY.interpolate({
    inputRange: [-1, 0, GALLERY_HEIGHT],
    outputRange: [0, 0, GALLERY_HEIGHT],
    extrapolate: 'clamp',
  });

  const galleryOverlayOpacity = scrollY.interpolate({
    inputRange: [0, GALLERY_HEIGHT * 0.9],
    outputRange: [0, 0.6],
    extrapolate: 'clamp',
  });

  const handleScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / screenWidth);
    setCurrentIndex(index);
  };

  const handleReservar = () => {
    navigation.navigate('Reservation', {
      room,
      nights,
      destination,
      dateRange,
      adults,
      checkin,
      checkout,
    });
  };

  return (
    <View style={styles.container}>
      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{nativeEvent: {contentOffset: {y: scrollY}}}],
          {useNativeDriver: true},
        )}>
        <Animated.View
          style={[
            styles.galleryContainer,
            {transform: [{translateY: galleryTranslateY}]},
          ]}>
          <FlatList
            testID="detail-gallery"
            data={images}
            keyExtractor={(_, index) => `img-${index}`}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={handleScrollEnd}
            renderItem={({item}) => (
              <Image
                source={{uri: item}}
                style={[styles.galleryImage, {width: screenWidth}]}
                resizeMode="cover"
              />
            )}
          />

          <Animated.View
            pointerEvents="none"
            testID="detail-gallery-overlay"
            style={[styles.galleryOverlay, {opacity: galleryOverlayOpacity}]}
          />

          <View style={styles.counterBadge} testID="detail-gallery-counter">
            <Text style={styles.counterText}>
              {currentIndex + 1}/{totalImages}
            </Text>
          </View>
        </Animated.View>

        <View style={styles.card}>
          <Text style={styles.name}>{room.nombreHotel}</Text>

          <View style={styles.ratingRow}>
            <View style={styles.ratingColumn}>
              <StarRating rating={room.estrellas} size={20} />
              <Text style={styles.ratingLabel}>{room.estrellas} estrellas</Text>
            </View>
            <View style={styles.ratingDivider} />
            <View style={styles.ratingColumn}>
              <Text style={styles.reviewsCount}>{room.cantidadResenas}</Text>
              <Text style={styles.ratingLabel}>Reseñas</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Información del hospedaje</Text>
          <View style={styles.infoContainer} testID="detail-info">
            {room.direccion.length > 0 && (
              <View style={styles.infoRow} testID="detail-info-direccion">
                <Icon
                  name="location-outline"
                  size={22}
                  color={Colors.textSecondary}
                />
                <View style={styles.infoTextWrapper}>
                  <Text style={styles.infoLabel}>Dirección</Text>
                  <Text style={styles.infoValue}>{room.direccion}</Text>
                </View>
              </View>
            )}

            {room.distancia.length > 0 && (
              <View style={styles.infoRow} testID="detail-info-distancia">
                <Icon
                  name="walk-outline"
                  size={22}
                  color={Colors.textSecondary}
                />
                <View style={styles.infoTextWrapper}>
                  <Text style={styles.infoLabel}>Distancia</Text>
                  <Text style={styles.infoValue}>{room.distancia}</Text>
                </View>
              </View>
            )}

            {room.acceso.length > 0 && (
              <View style={styles.infoRow} testID="detail-info-acceso">
                <Icon
                  name="bus-outline"
                  size={22}
                  color={Colors.textSecondary}
                />
                <View style={styles.infoTextWrapper}>
                  <Text style={styles.infoLabel}>Acceso</Text>
                  <Text style={styles.infoValue}>{room.acceso}</Text>
                </View>
              </View>
            )}

            {room.tipoHabitacion.length > 0 && (
              <View style={styles.infoRow} testID="detail-info-tipo">
                <Icon
                  name="home-outline"
                  size={22}
                  color={Colors.textSecondary}
                />
                <View style={styles.infoTextWrapper}>
                  <Text style={styles.infoLabel}>Tipo de habitación</Text>
                  <Text style={styles.infoValue}>
                    {capitalize(room.tipoHabitacion)}
                  </Text>
                </View>
              </View>
            )}

            {room.tamanoHabitacion.length > 0 && (
              <View style={styles.infoRow} testID="detail-info-tamano">
                <Icon
                  name="resize-outline"
                  size={22}
                  color={Colors.textSecondary}
                />
                <View style={styles.infoTextWrapper}>
                  <Text style={styles.infoLabel}>Tamaño</Text>
                  <Text style={styles.infoValue}>{room.tamanoHabitacion}</Text>
                </View>
              </View>
            )}

            {room.tipoCama.length > 0 && (
              <View style={styles.infoRow} testID="detail-info-cama">
                <Icon
                  name="bed-outline"
                  size={22}
                  color={Colors.textSecondary}
                />
                <View style={styles.infoTextWrapper}>
                  <Text style={styles.infoLabel}>
                    {room.tipoCama.length === 1
                      ? 'Tipo de cama'
                      : 'Tipos de cama'}
                  </Text>
                  <Text style={styles.infoValue}>
                    {room.tipoCama.map(capitalize).join(', ')}
                  </Text>
                </View>
              </View>
            )}

            {room.capacidadMaxima > 0 && (
              <View style={styles.infoRow} testID="detail-info-capacidad">
                <Icon
                  name="people-outline"
                  size={22}
                  color={Colors.textSecondary}
                />
                <View style={styles.infoTextWrapper}>
                  <Text style={styles.infoLabel}>Capacidad</Text>
                  <Text style={styles.infoValue}>
                    Hasta {room.capacidadMaxima}{' '}
                    {room.capacidadMaxima === 1 ? 'persona' : 'personas'}
                  </Text>
                </View>
              </View>
            )}

            {room.puntuacionResena > 0 && (
              <View style={styles.infoRow} testID="detail-info-puntuacion">
                <Icon name="star-outline" size={22} color={Colors.star} />
                <View style={styles.infoTextWrapper}>
                  <Text style={styles.infoLabel}>Puntuación</Text>
                  <Text style={styles.infoValue}>
                    {room.puntuacionResena.toFixed(1)} / 5
                  </Text>
                </View>
              </View>
            )}
          </View>

          {room.amenidades.length > 0 && (
            <>
              <View style={styles.divider} />
              <Text style={styles.sectionTitle}>Amenidades</Text>
              <View style={styles.amenitiesContainer} testID="detail-amenities">
                {room.amenidades.map((amenidad, index) => (
                  <View
                    key={`${amenidad}-${index}`}
                    style={styles.amenityItem}>
                    <Icon
                      name={getAmenityIcon(amenidad)}
                      size={24}
                      color={Colors.textSecondary}
                    />
                    <Text style={styles.amenityText}>{amenidad}</Text>
                  </View>
                ))}
              </View>
            </>
          )}
        </View>
      </Animated.ScrollView>

      <SafeAreaView
        style={styles.backButtonSafeArea}
        edges={['top']}
        pointerEvents="box-none">
        <TouchableOpacity
          testID="detail-back-button"
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Volver"
          hitSlop={{top: 12, bottom: 12, left: 12, right: 12}}>
          <Icon name="arrow-back" size={24} color={Colors.white} />
        </TouchableOpacity>
      </SafeAreaView>

      <View style={styles.footerSafeArea}>
        <View style={styles.footer}>
          <View style={styles.priceContainer}>
            <Text style={styles.totalPrice}>
              COP ${formatPrice(totalPrice)}
            </Text>
            <Text style={styles.nightsLabel}>
              Por{' '}
              <Text style={styles.nightsLink}>
                {nights} {nightsLabel}
              </Text>
            </Text>
          </View>
          <TouchableOpacity
            testID="detail-reserve-button"
            style={styles.reserveButton}
            onPress={handleReservar}
            accessibilityRole="button"
            accessibilityLabel="Reservar hospedaje"
            activeOpacity={0.85}>
            <Text style={styles.reserveButtonText}>RESERVAR</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  galleryContainer: {
    height: GALLERY_HEIGHT,
    backgroundColor: Colors.white,
  },
  galleryImage: {
    height: GALLERY_HEIGHT,
  },
  galleryOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.black,
  },
  backButtonSafeArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginLeft: 16,
  },
  counterBadge: {
    position: 'absolute',
    bottom: 56,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  counterText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollContent: {
    paddingBottom: 24,
    backgroundColor: Colors.white,
  },
  card: {
    backgroundColor: Colors.white,
    marginTop: -32,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
  },
  name: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 20,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  ratingColumn: {
    flex: 1,
    alignItems: 'center',
  },
  ratingDivider: {
    width: 1,
    height: 44,
    backgroundColor: Colors.grayBorder,
    marginHorizontal: 8,
  },
  ratingLabel: {
    marginTop: 6,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  reviewsCount: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.grayLight,
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  infoContainer: {
    marginBottom: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoTextWrapper: {
    marginLeft: 12,
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  infoValue: {
    fontSize: 15,
    color: Colors.textPrimary,
    fontWeight: '500',
    marginTop: 1,
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    paddingVertical: 10,
    paddingRight: 8,
  },
  amenityText: {
    marginLeft: 12,
    fontSize: 15,
    color: Colors.textPrimary,
    flex: 1,
  },
  footerSafeArea: {
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.grayBorder,
    shadowColor: Colors.black,
    shadowOffset: {width: 0, height: -4},
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 12,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  priceContainer: {
    flex: 1,
  },
  totalPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  nightsLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  nightsLink: {
    textDecorationLine: 'underline',
    color: Colors.textPrimary,
  },
  reserveButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingHorizontal: 24,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reserveButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
  },
});
