import {getAmenityIcon} from '../../src/utils/amenityIcons';

describe('getAmenityIcon', () => {
  it('returns wifi icon for "Internet Wifi"', () => {
    expect(getAmenityIcon('Internet Wifi')).toBe('wifi-outline');
  });

  it('returns thermometer icon for "Agua caliente"', () => {
    expect(getAmenityIcon('Agua caliente')).toBe('thermometer-outline');
  });

  it('returns water icon for "Accesorios de baño"', () => {
    expect(getAmenityIcon('Accesorios de baño')).toBe('water-outline');
  });

  it('returns restaurant icon for "Restaurante"', () => {
    expect(getAmenityIcon('Restaurante')).toBe('restaurant-outline');
  });

  it('returns snow icon for "Aire acondicionado"', () => {
    expect(getAmenityIcon('Aire acondicionado')).toBe('snow-outline');
  });

  it('is case-insensitive', () => {
    expect(getAmenityIcon('WIFI')).toBe('wifi-outline');
    expect(getAmenityIcon('wifi')).toBe('wifi-outline');
  });

  it('returns default icon for unknown amenity', () => {
    expect(getAmenityIcon('Algo desconocido')).toBe('checkmark-circle-outline');
  });

  it('returns default icon for empty string', () => {
    expect(getAmenityIcon('')).toBe('checkmark-circle-outline');
  });

  it('returns parking icon for parqueadero', () => {
    expect(getAmenityIcon('Parqueadero')).toBe('car-outline');
  });
});
